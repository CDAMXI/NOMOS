using Microsoft.EntityFrameworkCore;
using Nomos.Domain.Entities;
using Xunit;

namespace Nomos.Tests;

public class UnitOfWorkTests
{
    [Fact]
    public async Task InTransaction_Commits_WhenActionSucceeds()
    {
        using var h = new TestHarness();
        var (userId, _, brokerId) = await h.SeedAsync(margin: 100);

        await h.UnitOfWork.InTransactionAsync(async () =>
            await h.Holdings.AddAsync(new Holding
            {
                UserId = userId, AccountId = brokerId, Symbol = "X",
                Shares = 1, BuyPrice = 10, BuyDate = new DateOnly(2026, 1, 1)
            }));

        Assert.Equal(1, await h.Db.Holdings.CountAsync());
    }

    [Fact]
    public async Task InTransaction_RollsBack_WhenActionThrows()
    {
        using var h = new TestHarness();
        var (userId, _, brokerId) = await h.SeedAsync(margin: 100);

        await Assert.ThrowsAsync<InvalidOperationException>(async () =>
            await h.UnitOfWork.InTransactionAsync(async () =>
            {
                await h.Holdings.AddAsync(new Holding
                {
                    UserId = userId, AccountId = brokerId, Symbol = "X",
                    Shares = 1, BuyPrice = 10, BuyDate = new DateOnly(2026, 1, 1)
                });
                throw new InvalidOperationException("boom");
            }));

        // El SaveChanges del holding se hizo dentro de la tx; al no confirmarse, se revierte.
        Assert.Equal(0, await h.Db.Holdings.CountAsync());
    }
}
