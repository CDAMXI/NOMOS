using Nomos.Application.Services;
using Nomos.Domain.Entities;
using Xunit;

namespace Nomos.Tests;

public class NetWorthSeriesTests
{
    [Fact]
    public async Task DailySeries_ReconstructsNetBackwards_FromDatedMovements()
    {
        using var h = new TestHarness();
        var (userId, cashId, _) = await h.SeedAsync(cash: 1000);
        var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);

        var cat = new Category { UserId = userId, Name = "Comida", Icon = "🍔", Color = "#123456" };
        h.Db.Categories.Add(cat);
        await h.Db.SaveChangesAsync();
        h.Db.Expenses.Add(new Expense
        {
            UserId = userId, Amount = 100, CategoryId = cat.Id,
            Description = "x", Date = today.AddDays(-2), AccountId = cashId
        });
        h.Db.Incomes.Add(new Income
        {
            UserId = userId, Amount = 50, Description = "y", Date = today.AddDays(-1), AccountId = cashId
        });
        // Sin cuenta asignada: no mueve ningún saldo, así que tampoco debe mover la serie.
        h.Db.Expenses.Add(new Expense
        {
            UserId = userId, Amount = 999, CategoryId = cat.Id,
            Description = "z", Date = today.AddDays(-1), AccountId = null
        });
        await h.Db.SaveChangesAsync();

        var service = new NetWorthService(
            h.Accounts, h.Snapshots, h.Expenses, h.Incomes, h.Holdings, h.SnapshotWriter, h.UnitOfWork);
        var series = await service.GetDailySeriesAsync(userId, 5, today);

        Assert.Equal(5, series.Count);
        Assert.Equal(today.AddDays(-4), series[0].Date);
        Assert.Equal(today, series[4].Date);
        // Neto vivo = 1000 − 100 + 50 = 950; hacia atrás se deshacen los movimientos por fecha.
        Assert.Equal(1000m, series[0].Value);
        Assert.Equal(1000m, series[1].Value); // today−3: aún sin movimientos
        Assert.Equal(900m, series[2].Value);  // today−2: gasto de 100
        Assert.Equal(950m, series[3].Value);  // today−1: ingreso de 50 (el gasto sin cuenta no cuenta)
        Assert.Equal(950m, series[4].Value);  // hoy = neto vivo
    }
}
