using Nomos.Application.DTOs;
using Xunit;

namespace Nomos.Tests;

public class InvestmentServiceTests
{
    [Fact]
    public async Task Buy_DeductsMargin_AndCreatesLot()
    {
        using var h = new TestHarness();
        var (userId, _, brokerId) = await h.SeedAsync(margin: 300);

        var dto = await h.Investment.BuyAsync(brokerId, userId, new BuyRequest("AAPL", 2, 100));

        Assert.NotNull(dto);
        Assert.Equal(100m, dto!.Margin);
        Assert.Equal(200m, dto.Invested);
        Assert.Equal(300m, dto.Total);
        Assert.Single(dto.Holdings);
    }

    [Fact]
    public async Task Buy_OverMargin_Throws_AndPersistsNothing()
    {
        using var h = new TestHarness();
        var (userId, _, brokerId) = await h.SeedAsync(margin: 300);

        await Assert.ThrowsAsync<ArgumentException>(async () =>
            await h.Investment.BuyAsync(brokerId, userId, new BuyRequest("AAPL", 10, 100)));

        var broker = await h.Accounts.GetByIdAsync(brokerId, userId);
        Assert.Equal(300m, broker!.Balance); // margen intacto: nada quedó a medias
    }

    [Fact]
    public async Task Sell_MoreThanOwned_Throws()
    {
        using var h = new TestHarness();
        var (userId, _, brokerId) = await h.SeedAsync(margin: 300);
        var bought = await h.Investment.BuyAsync(brokerId, userId, new BuyRequest("AAPL", 2, 100));
        var lotId = bought!.Holdings[0].Id;

        await Assert.ThrowsAsync<ArgumentException>(async () =>
            await h.Investment.SellAsync(brokerId, userId, new SellRequest(lotId, 5, 130)));
    }

    [Fact]
    public async Task Sell_Partial_ReturnsProceedsToMargin()
    {
        using var h = new TestHarness();
        var (userId, _, brokerId) = await h.SeedAsync(margin: 300);
        var bought = await h.Investment.BuyAsync(brokerId, userId, new BuyRequest("AAPL", 2, 100));
        var lotId = bought!.Holdings[0].Id;

        var dto = await h.Investment.SellAsync(brokerId, userId, new SellRequest(lotId, 1, 130));

        Assert.Equal(230m, dto!.Margin);   // 100 margen + 130 de la venta
        Assert.Equal(100m, dto.Invested);  // queda 1 acción a 100
        Assert.Equal(330m, dto.Total);
    }

    [Fact]
    public async Task Transfer_Deposit_MovesCashToMargin()
    {
        using var h = new TestHarness();
        var (userId, cashId, brokerId) = await h.SeedAsync(cash: 500, margin: 100);

        var dto = await h.Investment.TransferAsync(brokerId, userId, new BrokerTransferRequest(cashId, 50, "deposit"));

        Assert.Equal(150m, dto!.Margin);
        var cash = await h.Accounts.GetByIdAsync(cashId, userId);
        Assert.Equal(450m, cash!.Balance);
    }

    [Fact]
    public async Task Transfer_Withdraw_OverMargin_Throws()
    {
        using var h = new TestHarness();
        var (userId, cashId, brokerId) = await h.SeedAsync(cash: 0, margin: 100);

        await Assert.ThrowsAsync<ArgumentException>(async () =>
            await h.Investment.TransferAsync(brokerId, userId, new BrokerTransferRequest(cashId, 500, "withdraw")));
    }

    [Fact]
    public async Task Broker_NotVisibleToOtherUser()
    {
        using var h = new TestHarness();
        var (u1, _, brokerId) = await h.SeedAsync(margin: 100);
        var (u2, _, _) = await h.SeedAsync();

        Assert.Null(await h.Investment.GetAsync(brokerId, u2));
        Assert.NotNull(await h.Investment.GetAsync(brokerId, u1));
    }
}
