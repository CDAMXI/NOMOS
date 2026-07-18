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
        services.AddScoped<ITripRepository, TripRepository>();
        services.AddScoped<ISnapshotRepository, SnapshotRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddScoped<AuthService>();
        services.AddScoped<CategoryService>();
        services.AddScoped<ExpenseService>();
        services.AddScoped<IncomeService>();
        services.AddScoped<SnapshotWriter>();
        services.AddScoped<NetWorthService>();
        services.AddScoped<InvestmentService>();
        services.AddScoped<TripService>();

        return services;
    }
}
