using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Nomos.Application.Common;
using Nomos.Domain.Entities;

namespace Nomos.Infrastructure.Persistence;

/// <summary>Seeds a demo user (demo / demo123) with the mockup data the first time the database is created.</summary>
public static class DbSeeder
{
    public static async Task SeedAsync(NomosDbContext db)
    {
        if (await db.Users.AnyAsync()) return;

        var demo = new User
        {
            Username = "demo",
            PasswordHash = PasswordHasher.Hash("demo123"),
            CreatedAt = DateTime.UtcNow
        };
        db.Users.Add(demo);
        await db.SaveChangesAsync(); // materialise demo.Id for the FK columns below

        var cats = DefaultCategories.All.ToDictionary(
            d => d.Name,
            d => new Category { UserId = demo.Id, Name = d.Name, Icon = d.Icon, Color = d.Color });
        db.Categories.AddRange(cats.Values);
        await db.SaveChangesAsync();

        var es = CultureInfo.GetCultureInfo("es-ES");
        var today = DateOnly.FromDateTime(DateTime.Today);
        var monthStart = new DateOnly(today.Year, today.Month, 1);
        string MonthName(DateOnly d) => d.ToString("MMMM", es);

        Expense New(string category, string description, decimal amount, DateOnly date) =>
            new() { UserId = demo.Id, CategoryId = cats[category].Id, Description = description, Amount = amount, Date = date };

        var expenses = new List<Expense>
        {
            // Current month
            New("Comida", "Mercadona", 68.50m, today),
            New("Transporte", "Metro Madrid", 4.20m, today),
            New("Ocio", "Spotify", 12.90m, today.AddDays(-1)),
            New("Vivienda", $"Alquiler {MonthName(monthStart)}", 850.00m, monthStart),
            New("Comida", "Restaurante La Mar", 34.75m, monthStart),
        };

        // Previous two months, so the 30d/90d charts and the month-over-month
        // comparison have data from day one.
        for (var i = 1; i <= 2; i++)
        {
            var start = monthStart.AddMonths(-i);
            expenses.AddRange(
                New("Vivienda", $"Alquiler {MonthName(start)}", 850.00m, start),
                New("Comida", "Mercadona", 61.30m, start.AddDays(6)),
                New("Comida", "Mercadona", 57.85m, start.AddDays(14)),
                New("Comida", "Carrefour", 43.20m, start.AddDays(21)),
                New("Transporte", "Abono transporte", 21.80m, start.AddDays(2)),
                New("Ocio", "Cine Yelmo", 17.60m, start.AddDays(10)),
                New("Salud", "Farmacia", 12.40m, start.AddDays(17)),
                New("Otros", "Amazon", 26.90m, start.AddDays(19)));
        }

        // The tail end of last month, visible in "Recientes" like the mockup.
        var prev = monthStart.AddMonths(-1);
        var prevLen = DateTime.DaysInMonth(prev.Year, prev.Month);
        expenses.AddRange(
            New("Salud", "Farmacia Prim", 22.00m, prev.AddDays(prevLen - 2)),
            New("Ocio", "Netflix", 9.99m, prev.AddDays(prevLen - 3)),
            New("Transporte", "Gasolina Repsol", 55.00m, prev.AddDays(prevLen - 4)));

        db.Expenses.AddRange(expenses);

        // Monthly salary for the current and previous two months.
        for (var i = 0; i <= 2; i++)
        {
            db.Incomes.Add(new Income
            {
                UserId = demo.Id,
                Description = "Nómina",
                Amount = 1450.00m,
                Date = monthStart.AddMonths(-i)
            });
        }

        db.Accounts.AddRange(
            new Account { UserId = demo.Id, Name = "BBVA Cuenta Corriente", Type = AccountType.Cash, Balance = 3450m, UpdatedAt = DateTime.UtcNow },
            new Account { UserId = demo.Id, Name = "ING Cuenta Ahorro", Type = AccountType.Cash, Balance = 13000m, UpdatedAt = DateTime.UtcNow },
            new Account { UserId = demo.Id, Name = "Cartera ETFs", Type = AccountType.Investment, Balance = 29000m, UpdatedAt = DateTime.UtcNow },
            new Account { UserId = demo.Id, Name = "Cripto", Type = AccountType.Investment, Balance = 2300m, UpdatedAt = DateTime.UtcNow },
            new Account { UserId = demo.Id, Name = "Coche (valor estimado)", Type = AccountType.Other, Balance = 12000m, UpdatedAt = DateTime.UtcNow },
            new Account { UserId = demo.Id, Name = "Préstamo estudios", Type = AccountType.Liability, Balance = 8200m, UpdatedAt = DateTime.UtcNow });

        // Monthly net-worth history for the current year (assets - liabilities).
        decimal[] nets = [38000m, 39800m, 42100m, 44500m, 47200m, 49800m, 50600m, 50900m, 51100m, 51300m, 51400m];
        var liab = 9500m;
        for (var month = 1; month < today.Month; month++)
        {
            var net = nets[Math.Min(month - 1, nets.Length - 1)];
            db.Snapshots.Add(new NetWorthSnapshot
            {
                UserId = demo.Id,
                Date = new DateOnly(today.Year, month, 1),
                Assets = net + liab,
                Liabilities = liab
            });
            liab -= 150m;
        }

        await db.SaveChangesAsync();
    }
}
