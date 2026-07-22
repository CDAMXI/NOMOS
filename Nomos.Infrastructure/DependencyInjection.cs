using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Nomos.Application.Interfaces;
using Nomos.Application.Services;
using Nomos.Infrastructure.Persistence;

namespace Nomos.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddNomos(this IServiceCollection services, string connectionString)
    {
        // Acepta tanto el formato URI (postgres://user:pass@host:port/db, el que da Supabase/Heroku)
        // como el clave-valor de Npgsql. Sin esto, pegar la URI en el env rompe la conexión con
        // "Format of the initialization string does not conform to specification".
        connectionString = NormalizeConnectionString(connectionString);

        // SQLite when the connection string is a file ("Data Source=…"); PostgreSQL/Supabase otherwise.
        services.AddDbContext<NomosDbContext>(options =>
        {
            if (connectionString.Contains("Data Source", StringComparison.OrdinalIgnoreCase))
                options.UseSqlite(connectionString);
            else
                options.UseNpgsql(connectionString);
        });

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IExpenseRepository, ExpenseRepository>();
        services.AddScoped<IIncomeRepository, IncomeRepository>();
        services.AddScoped<IAccountRepository, AccountRepository>();
        services.AddScoped<IHoldingRepository, HoldingRepository>();
        services.AddScoped<ISnapshotRepository, SnapshotRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddScoped<AuthService>();
        services.AddScoped<CategoryService>();
        services.AddScoped<ExpenseService>();
        services.AddScoped<IncomeService>();
        services.AddScoped<SnapshotWriter>();
        services.AddScoped<NetWorthService>();
        services.AddScoped<InvestmentService>();

        return services;
    }

    /// <summary>
    /// Si la cadena es una URI de Postgres (postgres:// o postgresql://), la convierte al formato
    /// clave-valor que espera Npgsql. Cualquier otra cosa (clave-valor, o "Data Source=…" de SQLite)
    /// se devuelve tal cual, solo recortando comillas/espacios envolventes.
    /// </summary>
    internal static string NormalizeConnectionString(string connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString)) return connectionString;
        var cs = connectionString.Trim().Trim('"');

        if (!cs.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
            !cs.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
            return cs;

        try
        {
            var uri = new Uri(cs);
            var userInfo = uri.UserInfo.Split(':', 2);
            var database = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/'));
            var port = uri.Port > 0 ? uri.Port : 5432;

            var b = new System.Text.StringBuilder();
            b.Append($"Host={uri.Host};Port={port};Database={database};");
            b.Append($"Username={Uri.UnescapeDataString(userInfo[0])};");
            if (userInfo.Length > 1)
                b.Append($"Password={Uri.UnescapeDataString(userInfo[1])};");
            // Supabase exige TLS; SSL Mode=Require cifra sin verificar la CA (suficiente aquí).
            b.Append("SSL Mode=Require;");
            return b.ToString();
        }
        catch
        {
            // URI malformada (p. ej. contraseña con caracteres sin escapar): no romper el arranque.
            // Se devuelve tal cual; el operador debe usar el formato clave-valor en el env.
            return cs;
        }
    }
}
