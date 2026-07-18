using Nomos.Application.DTOs;
using Xunit;

namespace Nomos.Tests;

public class TripServiceTests
{
    [Fact]
    public async Task Expenses_ConvertToEur_ByCurrencyRate()
    {
        using var h = new TestHarness();
        var (userId, _, _) = await h.SeedAsync();
        var trip = await h.Trip.CreateAsync(userId,
            new SaveTripRequest("Japon", "Tokio", [new("JPY", 0.0061m), new("EUR", 1m)]));

        await h.Trip.AddExpenseAsync(trip.Id, userId, new SaveTripExpenseRequest(15000, "JPY", null, "Sushi", null, null));
        var detail = await h.Trip.AddExpenseAsync(trip.Id, userId, new SaveTripExpenseRequest(80, "EUR", null, "Taxi", null, null));

        Assert.Equal(171.5m, detail!.Summary.TotalEur); // 15000*0.0061 + 80
        Assert.Equal(2, detail.Summary.ExpenseCount);
    }

    [Fact]
    public async Task CannotRemoveCurrency_WithExpenses()
    {
        using var h = new TestHarness();
        var (userId, _, _) = await h.SeedAsync();
        var trip = await h.Trip.CreateAsync(userId,
            new SaveTripRequest("T", "X", [new("USD", 0.9m), new("EUR", 1m)]));
        await h.Trip.AddExpenseAsync(trip.Id, userId, new SaveTripExpenseRequest(10, "USD", null, "x", null, null));

        await Assert.ThrowsAsync<ArgumentException>(async () =>
            await h.Trip.UpdateAsync(trip.Id, userId, new SaveTripRequest("T", "X", [new("EUR", 1m)])));
    }

    [Fact]
    public async Task Expense_WithCurrencyNotInTrip_Throws()
    {
        using var h = new TestHarness();
        var (userId, _, _) = await h.SeedAsync();
        var trip = await h.Trip.CreateAsync(userId, new SaveTripRequest("T", "X", [new("EUR", 1m)]));

        await Assert.ThrowsAsync<ArgumentException>(async () =>
            await h.Trip.AddExpenseAsync(trip.Id, userId, new SaveTripExpenseRequest(10, "USD", null, "x", null, null)));
    }

    [Fact]
    public async Task Trip_NotVisibleToOtherUser()
    {
        using var h = new TestHarness();
        var (u1, _, _) = await h.SeedAsync();
        var (u2, _, _) = await h.SeedAsync();
        var trip = await h.Trip.CreateAsync(u1, new SaveTripRequest("T", "X", [new("EUR", 1m)]));

        Assert.Null(await h.Trip.GetDetailAsync(trip.Id, u2));
        Assert.NotNull(await h.Trip.GetDetailAsync(trip.Id, u1));
    }
}
