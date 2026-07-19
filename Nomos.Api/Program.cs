using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Nomos.Application.Common;
using Nomos.Application.DTOs;
using Nomos.Application.Services;
using Nomos.Infrastructure;
using Nomos.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Cloud hosts (Render, Railway, Cloud Run…) inject the port to listen on via PORT.
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Falls back to a local SQLite file when no connection string is configured, so the app runs
// anywhere with zero setup. Set ConnectionStrings__Nomos to a PostgreSQL/Supabase string for
// a persistent, production database.
var connectionString = builder.Configuration.GetConnectionString("Nomos")
    ?? "Data Source=nomos_local.db";
builder.Services.AddNomos(connectionString);

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "nomos_auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Strict;
        // Solo por HTTPS. Con UseForwardedHeaders el proxy de Render marca el esquema real como https.
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        options.ExpireTimeSpan = TimeSpan.FromDays(30);
        options.SlidingExpiration = true;
        // This is an API: answer with status codes, never with login-page redirects.
        options.Events.OnRedirectToLogin = ctx => { ctx.Response.StatusCode = StatusCodes.Status401Unauthorized; return Task.CompletedTask; };
        options.Events.OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = StatusCodes.Status403Forbidden; return Task.CompletedTask; };
    });
builder.Services.AddAuthorization();

// Red de seguridad de errores: mapea excepciones conocidas (incl. conflicto de concurrencia) a
// códigos/mensajes claros y registra los 500. Los try/catch de los endpoints siguen funcionando;
// esto captura lo que se les escape.
builder.Services.AddExceptionHandler<Nomos.Api.GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// Detrás del proxy de Render: confiar en X-Forwarded-Proto/For para que el esquema real (https)
// llegue a la app (necesario para cookies Secure y enlaces correctos).
builder.Services.Configure<ForwardedHeadersOptions>(o =>
{
    o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    o.KnownIPNetworks.Clear();
    o.KnownProxies.Clear();
});

// Rate limiting del login: frena la fuerza bruta (por IP, ventana fija).
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    // Cuerpo con mensaje claro: si no, el front mostraría el genérico "Ha ocurrido un error".
    options.OnRejected = async (ctx, ct) =>
    {
        ctx.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        await ctx.HttpContext.Response.WriteAsJsonAsync(
            "Demasiados intentos. Espera un momento e inténtalo de nuevo.", ct);
    };
    options.AddPolicy("login", http =>
        RateLimitPartition.GetFixedWindowLimiter(
            http.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions { PermitLimit = 10, Window = TimeSpan.FromMinutes(1) }));
});

var app = builder.Build();

// Apply migrations (creates the schema on first run) and seed demo data.
// Envuelto en try/catch: un fallo aquí (BD momentáneamente inaccesible, error puntual del runtime al
// abrir la conexión…) NO debe tumbar el arranque y marcar el deploy como fallido. La app levanta igual
// y sirve; las peticiones reintentan la BD. Las migraciones ya aplicadas hacen que esto sea seguro.
using (var scope = app.Services.CreateScope())
{
    try
    {
        // Incluye la construcción del DbContext dentro del try: si la cadena de conexión está mal,
        // el fallo se captura aquí en vez de tumbar el proceso.
        var db = scope.ServiceProvider.GetRequiredService<NomosDbContext>();
        // SQLite (local dev) creates the schema directly; PostgreSQL/Supabase applies migrations.
        if (db.Database.ProviderName?.Contains("Sqlite") == true)
            db.Database.EnsureCreated();
        else
            db.Database.Migrate();
        await DbSeeder.SeedAsync(db);
        await LegacyBackfill.RunAsync(db); // give pre-account users a default "Efectivo" account (one-time)
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Fallo en la inicialización de la base de datos al arrancar; la app continúa.");
    }
}

app.UseForwardedHeaders();
app.UseExceptionHandler();

// Cabeceras de seguridad en todas las respuestas (defensa en profundidad).
app.Use(async (ctx, next) =>
{
    var h = ctx.Response.Headers;
    h["X-Content-Type-Options"] = "nosniff";
    h["X-Frame-Options"] = "DENY";
    h["Referrer-Policy"] = "no-referrer";
    // style-src 'unsafe-inline': el front fija colores con atributos style (chips, donut).
    // img-src data:: avatares y facturas van como data URL. Sin scripts externos ni framing.
    h["Content-Security-Policy"] =
        "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; " +
        "script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'";
    await next();
});

app.UseDefaultFiles();
// "no-cache" = el navegador puede guardar pero DEBE revalidar (ETag) antes de usar, así los
// despliegues de JS/CSS/HTML se recogen sin forzar recarga a mano.
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx => ctx.Context.Response.Headers.CacheControl = "no-cache"
});
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

static DateOnly Today() => AppClock.Today();
static int UserId(ClaimsPrincipal user) => int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

static async Task SignInAsync(HttpContext http, UserDto user)
{
    var identity = new ClaimsIdentity(
        [new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), new Claim(ClaimTypes.Name, user.Username)],
        CookieAuthenticationDefaults.AuthenticationScheme);
    await http.SignInAsync(
        CookieAuthenticationDefaults.AuthenticationScheme,
        new ClaimsPrincipal(identity),
        new AuthenticationProperties { IsPersistent = true });
}

var api = app.MapGroup("/api").RequireAuthorization();

// --- Autenticación y perfil ---
var auth = api.MapGroup("/auth");

auth.MapPost("/register", async (RegisterRequest request, AuthService service, CategoryService categoryService, NetWorthService netWorthService, HttpContext http) =>
{
    try
    {
        var user = await service.RegisterAsync(request);
        await categoryService.SeedDefaultsAsync(user.Id); // every new user starts with the default categories
        await netWorthService.SeedDefaultAccountAsync(user.Id); // …and a default "Efectivo" account to hold movements
        await SignInAsync(http, user);
        return Results.Created("/api/auth/me", user);
    }
    catch (ConflictException ex) { return Results.Conflict(ex.Message); }
    catch (ArgumentException ex) { return Results.BadRequest(ex.Message); }
    catch (DbUpdateException) { return Results.Conflict("Ese nombre de usuario ya está en uso."); }
}).AllowAnonymous();

auth.MapPost("/login", async (LoginRequest request, AuthService service, HttpContext http) =>
{
    var user = await service.ValidateLoginAsync(request);
    if (user is null)
        return Results.Json("Usuario o contraseña incorrectos.", statusCode: StatusCodes.Status401Unauthorized);
    await SignInAsync(http, user);
    return Results.Ok(user);
}).AllowAnonymous().RequireRateLimiting("login");

auth.MapPost("/logout", async (HttpContext http) =>
{
    await http.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    return Results.NoContent();
});

auth.MapGet("/me", async (ClaimsPrincipal principal, AuthService service) =>
{
    var user = await service.GetAsync(UserId(principal));
    return user is null ? Results.Unauthorized() : Results.Ok(user);
});

auth.MapPut("/profile", async (UpdateProfileRequest request, ClaimsPrincipal principal, AuthService service, HttpContext http) =>
{
    try
    {
        var user = await service.UpdateProfileAsync(UserId(principal), request);
        await SignInAsync(http, user); // refresh the username claim in the cookie
        return Results.Ok(user);
    }
    catch (ConflictException ex) { return Results.Conflict(ex.Message); }
    catch (ArgumentException ex) { return Results.BadRequest(ex.Message); }
    catch (DbUpdateException) { return Results.Conflict("Ese nombre de usuario ya está en uso."); }
});

auth.MapPut("/password", async (ChangePasswordRequest request, ClaimsPrincipal principal, AuthService service) =>
{
    try
    {
        await service.ChangePasswordAsync(UserId(principal), request);
        return Results.NoContent();
    }
    catch (ArgumentException ex) { return Results.BadRequest(ex.Message); }
});

// --- Categorías ---
api.MapGet("/categories", (ClaimsPrincipal principal, CategoryService service) =>
    service.GetAllAsync(UserId(principal)));

api.MapPost("/categories", async Task<Results<Created<CategoryDto>, Conflict<string>, BadRequest<string>>>
    (CreateCategoryRequest request, ClaimsPrincipal principal, CategoryService service) =>
{
    try
    {
        var created = await service.CreateAsync(UserId(principal), request);
        return TypedResults.Created($"/api/categories/{created.Id}", created);
    }
    catch (ConflictException ex) { return TypedResults.Conflict(ex.Message); }
    catch (ArgumentException ex) { return TypedResults.BadRequest(ex.Message); }
});

api.MapPut("/categories/{id:int}", async Task<Results<Ok<CategoryDto>, NotFound, Conflict<string>, BadRequest<string>>>
    (int id, UpdateCategoryRequest request, ClaimsPrincipal principal, CategoryService service) =>
{
    try
    {
        var updated = await service.UpdateAsync(id, UserId(principal), request);
        return updated is null ? TypedResults.NotFound() : TypedResults.Ok(updated);
    }
    catch (ConflictException ex) { return TypedResults.Conflict(ex.Message); }
    catch (ArgumentException ex) { return TypedResults.BadRequest(ex.Message); }
});

api.MapDelete("/categories/{id:int}", async Task<Results<NoContent, NotFound, Conflict<string>>>
    (int id, ClaimsPrincipal principal, CategoryService service) =>
{
    try
    {
        return await service.DeleteAsync(id, UserId(principal)) ? TypedResults.NoContent() : TypedResults.NotFound();
    }
    catch (ConflictException ex) { return TypedResults.Conflict(ex.Message); }
});

// --- Gastos e ingresos ---
api.MapGet("/transactions", (ClaimsPrincipal principal, ExpenseService service) =>
    service.GetTransactionsAsync(UserId(principal)));

// Exporta todos los movimientos del usuario a Excel (.xlsx): fechas/importes con formato y
// columnas auto-ajustadas (el CSV no puede guardar anchos ni formato).
api.MapGet("/transactions/export", async (ClaimsPrincipal principal, ExpenseService service) =>
{
    var txs = await service.GetTransactionsAsync(UserId(principal));
    return Results.File(ExcelExport.Transactions(txs),
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "pluto-movimientos.xlsx");
});

api.MapGet("/expenses/dashboard", (ClaimsPrincipal principal, ExpenseService service, int days = 30) =>
    service.GetDashboardAsync(UserId(principal), Math.Clamp(days, 7, 365), Today()));

api.MapPost("/expenses", async Task<Results<Created<ExpenseDto>, BadRequest<string>>>
    (CreateExpenseRequest request, ClaimsPrincipal principal, ExpenseService service) =>
{
    try
    {
        var created = await service.CreateAsync(UserId(principal), request, Today());
        return TypedResults.Created($"/api/expenses/{created.Id}", created);
    }
    catch (ArgumentException ex)
    {
        return TypedResults.BadRequest(ex.Message);
    }
});

api.MapPut("/expenses/{id:int}", async Task<Results<Ok<ExpenseDto>, NotFound, BadRequest<string>>>
    (int id, UpdateExpenseRequest request, ClaimsPrincipal principal, ExpenseService service) =>
{
    try
    {
        var updated = await service.UpdateAsync(id, UserId(principal), request);
        return updated is null ? TypedResults.NotFound() : TypedResults.Ok(updated);
    }
    catch (ArgumentException ex)
    {
        return TypedResults.BadRequest(ex.Message);
    }
});

api.MapDelete("/expenses/{id:int}", async Task<Results<NoContent, NotFound>>
    (int id, ClaimsPrincipal principal, ExpenseService service) =>
    await service.DeleteAsync(id, UserId(principal)) ? TypedResults.NoContent() : TypedResults.NotFound());

api.MapPost("/incomes", async Task<Results<Created<IncomeDto>, BadRequest<string>>>
    (CreateIncomeRequest request, ClaimsPrincipal principal, IncomeService service) =>
{
    try
    {
        var created = await service.CreateAsync(UserId(principal), request, Today());
        return TypedResults.Created($"/api/incomes/{created.Id}", created);
    }
    catch (ArgumentException ex)
    {
        return TypedResults.BadRequest(ex.Message);
    }
});

api.MapPut("/incomes/{id:int}", async Task<Results<Ok<IncomeDto>, NotFound, BadRequest<string>>>
    (int id, UpdateIncomeRequest request, ClaimsPrincipal principal, IncomeService service) =>
{
    try
    {
        var updated = await service.UpdateAsync(id, UserId(principal), request);
        return updated is null ? TypedResults.NotFound() : TypedResults.Ok(updated);
    }
    catch (ArgumentException ex)
    {
        return TypedResults.BadRequest(ex.Message);
    }
});

api.MapDelete("/incomes/{id:int}", async Task<Results<NoContent, NotFound>>
    (int id, ClaimsPrincipal principal, IncomeService service) =>
    await service.DeleteAsync(id, UserId(principal)) ? TypedResults.NoContent() : TypedResults.NotFound());

// --- Patrimonio ---
api.MapGet("/networth", (ClaimsPrincipal principal, NetWorthService service) =>
    service.GetOverviewAsync(UserId(principal), Today()));

// Cash/bank accounts a movement can be assigned to (the account picker in the app).
api.MapGet("/accounts", async (ClaimsPrincipal principal, NetWorthService service) =>
    (await service.GetOverviewAsync(UserId(principal), Today())).Accounts);

api.MapPost("/accounts", async Task<Results<Created<AccountDto>, BadRequest<string>>>
    (CreateAccountRequest request, ClaimsPrincipal principal, NetWorthService service) =>
{
    try
    {
        var created = await service.CreateAsync(UserId(principal), request, Today());
        return TypedResults.Created($"/api/accounts/{created.Id}", created);
    }
    catch (ArgumentException ex)
    {
        return TypedResults.BadRequest(ex.Message);
    }
});

api.MapPut("/accounts/{id:int}", async Task<Results<Ok<AccountDto>, NotFound, BadRequest<string>>>
    (int id, UpdateAccountRequest request, ClaimsPrincipal principal, NetWorthService service) =>
{
    try
    {
        var updated = await service.UpdateAsync(id, UserId(principal), request, Today());
        return updated is null ? TypedResults.NotFound() : TypedResults.Ok(updated);
    }
    catch (ArgumentException ex)
    {
        return TypedResults.BadRequest(ex.Message);
    }
});

api.MapDelete("/accounts/{id:int}", async Task<Results<NoContent, NotFound>>
    (int id, ClaimsPrincipal principal, NetWorthService service) =>
    await service.DeleteAsync(id, UserId(principal), Today()) ? TypedResults.NoContent() : TypedResults.NotFound());

// --- Inversiones (broker): posiciones, compra/venta y depósitos/retiradas de margen ---
api.MapGet("/brokers/{id:int}", async Task<Results<Ok<BrokerDto>, NotFound>>
    (int id, ClaimsPrincipal principal, InvestmentService service) =>
{
    var broker = await service.GetAsync(id, UserId(principal));
    return broker is null ? TypedResults.NotFound() : TypedResults.Ok(broker);
});

api.MapPost("/brokers/{id:int}/buy", async Task<Results<Ok<BrokerDto>, NotFound, BadRequest<string>>>
    (int id, BuyRequest request, ClaimsPrincipal principal, InvestmentService service) =>
{
    try
    {
        var broker = await service.BuyAsync(id, UserId(principal), request);
        return broker is null ? TypedResults.NotFound() : TypedResults.Ok(broker);
    }
    catch (ArgumentException ex) { return TypedResults.BadRequest(ex.Message); }
});

api.MapPost("/brokers/{id:int}/sell", async Task<Results<Ok<BrokerDto>, NotFound, BadRequest<string>>>
    (int id, SellRequest request, ClaimsPrincipal principal, InvestmentService service) =>
{
    try
    {
        var broker = await service.SellAsync(id, UserId(principal), request);
        return broker is null ? TypedResults.NotFound() : TypedResults.Ok(broker);
    }
    catch (ArgumentException ex) { return TypedResults.BadRequest(ex.Message); }
});

api.MapPost("/brokers/{id:int}/transfer", async Task<Results<Ok<BrokerDto>, NotFound, BadRequest<string>>>
    (int id, BrokerTransferRequest request, ClaimsPrincipal principal, InvestmentService service) =>
{
    try
    {
        var broker = await service.TransferAsync(id, UserId(principal), request);
        return broker is null ? TypedResults.NotFound() : TypedResults.Ok(broker);
    }
    catch (ArgumentException ex) { return TypedResults.BadRequest(ex.Message); }
});

// --- Viajes (gastos de viaje multi-moneda; registro aparte) ---
api.MapGet("/trips", (ClaimsPrincipal principal, TripService service) =>
    service.GetAllAsync(UserId(principal)));

api.MapGet("/trips/{id:int}", async Task<Results<Ok<TripDetailDto>, NotFound>>
    (int id, ClaimsPrincipal principal, TripService service) =>
{
    var trip = await service.GetDetailAsync(id, UserId(principal));
    return trip is null ? TypedResults.NotFound() : TypedResults.Ok(trip);
});

api.MapPost("/trips", async Task<Results<Created<TripDetailDto>, BadRequest<string>>>
    (SaveTripRequest request, ClaimsPrincipal principal, TripService service) =>
{
    try
    {
        var created = await service.CreateAsync(UserId(principal), request);
        return TypedResults.Created($"/api/trips/{created.Id}", created);
    }
    catch (ArgumentException ex) { return TypedResults.BadRequest(ex.Message); }
});

api.MapPut("/trips/{id:int}", async Task<Results<Ok<TripDetailDto>, NotFound, BadRequest<string>>>
    (int id, SaveTripRequest request, ClaimsPrincipal principal, TripService service) =>
{
    try
    {
        var updated = await service.UpdateAsync(id, UserId(principal), request);
        return updated is null ? TypedResults.NotFound() : TypedResults.Ok(updated);
    }
    catch (ArgumentException ex) { return TypedResults.BadRequest(ex.Message); }
});

api.MapDelete("/trips/{id:int}", async Task<Results<NoContent, NotFound>>
    (int id, ClaimsPrincipal principal, TripService service) =>
    await service.DeleteAsync(id, UserId(principal)) ? TypedResults.NoContent() : TypedResults.NotFound());

api.MapPost("/trips/{id:int}/expenses", async Task<Results<Ok<TripDetailDto>, NotFound, BadRequest<string>>>
    (int id, SaveTripExpenseRequest request, ClaimsPrincipal principal, TripService service) =>
{
    try
    {
        var trip = await service.AddExpenseAsync(id, UserId(principal), request);
        return trip is null ? TypedResults.NotFound() : TypedResults.Ok(trip);
    }
    catch (ArgumentException ex) { return TypedResults.BadRequest(ex.Message); }
});

api.MapPut("/trips/{id:int}/expenses/{eid:int}", async Task<Results<Ok<TripDetailDto>, NotFound, BadRequest<string>>>
    (int id, int eid, SaveTripExpenseRequest request, ClaimsPrincipal principal, TripService service) =>
{
    try
    {
        var trip = await service.UpdateExpenseAsync(id, eid, UserId(principal), request);
        return trip is null ? TypedResults.NotFound() : TypedResults.Ok(trip);
    }
    catch (ArgumentException ex) { return TypedResults.BadRequest(ex.Message); }
});

api.MapDelete("/trips/{id:int}/expenses/{eid:int}", async Task<Results<Ok<TripDetailDto>, NotFound>>
    (int id, int eid, ClaimsPrincipal principal, TripService service) =>
{
    if (!await service.DeleteExpenseAsync(id, eid, UserId(principal))) return TypedResults.NotFound();
    var trip = await service.GetDetailAsync(id, UserId(principal));
    return trip is null ? TypedResults.NotFound() : TypedResults.Ok(trip);
});

api.MapGet("/trips/{id:int}/expenses/{eid:int}/receipt", async Task<Results<Ok<string>, NotFound>>
    (int id, int eid, ClaimsPrincipal principal, TripService service) =>
{
    var receipt = await service.GetReceiptAsync(id, eid, UserId(principal));
    return receipt is null ? TypedResults.NotFound() : TypedResults.Ok(receipt);
});

app.Run();
