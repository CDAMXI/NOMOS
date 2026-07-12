using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http.HttpResults;
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
        options.ExpireTimeSpan = TimeSpan.FromDays(30);
        options.SlidingExpiration = true;
        // This is an API: answer with status codes, never with login-page redirects.
        options.Events.OnRedirectToLogin = ctx => { ctx.Response.StatusCode = StatusCodes.Status401Unauthorized; return Task.CompletedTask; };
        options.Events.OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = StatusCodes.Status403Forbidden; return Task.CompletedTask; };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

// Apply migrations (creates the schema on first run) and seed demo data.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<NomosDbContext>();
    // SQLite (local dev) creates the schema directly; PostgreSQL/Supabase applies migrations.
    if (db.Database.ProviderName?.Contains("Sqlite") == true)
        db.Database.EnsureCreated();
    else
        db.Database.Migrate();
    await DbSeeder.SeedAsync(db);
    await LegacyBackfill.RunAsync(db); // give pre-account users a default "Efectivo" account (one-time)
}

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

static DateOnly Today() => DateOnly.FromDateTime(DateTime.Today);
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
}).AllowAnonymous();

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

app.Run();
