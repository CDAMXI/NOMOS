using Pluto.Application.DTOs;
using Xunit;

namespace Pluto.Tests;

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
    public async Task Buy_WithExplicitDate_UsesIt_AndDefaultsToTodayOtherwise()
    {
        using var h = new TestHarness();
        var (userId, _, brokerId) = await h.SeedAsync(margin: 300);

        var dated = await h.Investment.BuyAsync(brokerId, userId, new BuyRequest("AAPL", 1, 50, new DateOnly(2026, 7, 15)));
        Assert.Equal(new DateOnly(2026, 7, 15), dated!.Holdings[0].BuyDate);

        var undated = await h.Investment.BuyAsync(brokerId, userId, new BuyRequest("MSFT", 1, 50));
        // Sin fecha explícita: hoy según el reloj de la app (hora española), no el del sistema.
        Assert.Equal(Pluto.Application.Common.AppClock.Today(), undated!.Holdings.Single(x => x.Symbol == "MSFT").BuyDate);
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
    public async Task UpdateHolding_AdjustsMarginByCostDifference_BothWays()
    {
        using var h = new TestHarness();
        var (userId, _, brokerId) = await h.SeedAsync(margin: 300);
        var bought = await h.Investment.BuyAsync(brokerId, userId, new BuyRequest("AAPL", 2, 100));
        var lotId = bought!.Holdings[0].Id; // margen 100, coste 200

        // Corrección al alza (2×120=240): el margen absorbe los 40 de diferencia.
        var up = await h.Investment.UpdateHoldingAsync(brokerId, userId, lotId,
            new UpdateHoldingRequest("MSFT", 2, 120, new DateOnly(2026, 7, 1)));
        Assert.Equal(60m, up!.Margin);
        Assert.Equal(240m, up.Invested);
        Assert.Equal(300m, up.Total); // el total del broker se conserva: solo se movió margen↔posición
        Assert.Equal("MSFT", up.Holdings[0].Symbol);
        Assert.Equal(new DateOnly(2026, 7, 1), up.Holdings[0].BuyDate);

        // Corrección a la baja (1×100=100): devuelve 140 al margen.
        var down = await h.Investment.UpdateHoldingAsync(brokerId, userId, lotId,
            new UpdateHoldingRequest("MSFT", 1, 100, null));
        Assert.Equal(200m, down!.Margin);
        Assert.Equal(100m, down.Invested);
        Assert.Equal(new DateOnly(2026, 7, 1), down.Holdings[0].BuyDate); // sin fecha: conserva la anterior
    }

    [Fact]
    public async Task UpdateHolding_BeyondMargin_Throws_AndPersistsNothing()
    {
        using var h = new TestHarness();
        var (userId, _, brokerId) = await h.SeedAsync(margin: 300);
        var bought = await h.Investment.BuyAsync(brokerId, userId, new BuyRequest("AAPL", 2, 100));
        var lotId = bought!.Holdings[0].Id; // margen 100

        // Nuevo coste 350: necesita 150 más que los 100 de margen libre.
        await Assert.ThrowsAsync<ArgumentException>(async () =>
            await h.Investment.UpdateHoldingAsync(brokerId, userId, lotId,
                new UpdateHoldingRequest("AAPL", 3.5m, 100, null)));

        var broker = await h.Accounts.GetByIdAsync(brokerId, userId);
        Assert.Equal(100m, broker!.Balance); // nada quedó a medias
    }

    [Fact]
    public async Task DeleteHolding_RefundsFullCostToMargin_AndRemovesLot()
    {
        using var h = new TestHarness();
        var (userId, _, brokerId) = await h.SeedAsync(margin: 300);
        var bought = await h.Investment.BuyAsync(brokerId, userId, new BuyRequest("AAPL", 2, 100));
        var lotId = bought!.Holdings[0].Id; // margen 100, coste 200

        var dto = await h.Investment.DeleteHoldingAsync(brokerId, userId, lotId);

        Assert.Equal(300m, dto!.Margin); // la compra deshecha: el coste vuelve integro
        Assert.Equal(0m, dto.Invested);
        Assert.Empty(dto.Holdings);
    }

    [Fact]
    public async Task DeleteHolding_WrongAccountOrLot_ReturnsNull()
    {
        using var h = new TestHarness();
        var (userId, cashId, brokerId) = await h.SeedAsync(margin: 300);
        var bought = await h.Investment.BuyAsync(brokerId, userId, new BuyRequest("AAPL", 1, 100));
        var lotId = bought!.Holdings[0].Id;

        Assert.Null(await h.Investment.DeleteHoldingAsync(cashId, userId, lotId));
        Assert.Null(await h.Investment.DeleteHoldingAsync(brokerId, userId, lotId + 999));

        var broker = await h.Accounts.GetByIdAsync(brokerId, userId);
        Assert.Equal(200m, broker!.Balance); // nada cambio
    }

    [Fact]
    public async Task UpdateHolding_WrongAccountOrLot_ReturnsNull()
    {
        using var h = new TestHarness();
        var (userId, cashId, brokerId) = await h.SeedAsync(margin: 300);
        var bought = await h.Investment.BuyAsync(brokerId, userId, new BuyRequest("AAPL", 1, 100));
        var lotId = bought!.Holdings[0].Id;

        Assert.Null(await h.Investment.UpdateHoldingAsync(cashId, userId, lotId,
            new UpdateHoldingRequest("AAPL", 1, 100, null))); // la cuenta no es un broker
        Assert.Null(await h.Investment.UpdateHoldingAsync(brokerId, userId, lotId + 999,
            new UpdateHoldingRequest("AAPL", 1, 100, null))); // lote inexistente
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
