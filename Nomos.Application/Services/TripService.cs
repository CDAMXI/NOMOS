using Nomos.Application.DTOs;
using Nomos.Application.Interfaces;
using Nomos.Domain.Entities;

namespace Nomos.Application.Services;

/// <summary>
/// Gastos de viaje: cada viaje tiene sus monedas (con tasa manual a €) y sus gastos. Es un
/// registro aparte — no toca cuentas ni patrimonio. El resumen agrupa por moneda y por categoría,
/// y da un total en € (Amount × tasa de la moneda del gasto).
/// </summary>
public class TripService(ITripRepository trips, ICategoryRepository categories)
{
    private const int MaxNameLength = 80;
    private const int MaxDestinationsLength = 200;
    private const int MaxCurrencyCodeLength = 8;
    private const int MaxReceiptLength = 1_500_000; // ~1,1 MB en base64; sobra para una foto comprimida

    public async Task<List<TripListItemDto>> GetAllAsync(int userId)
    {
        var all = await trips.GetAllAsync(userId);
        return all
            .OrderByDescending(t => t.CreatedAt).ThenByDescending(t => t.Id)
            .Select(t =>
            {
                var rates = RateMap(t.Currencies);
                return new TripListItemDto(
                    t.Id, t.Name, t.Destinations,
                    t.Currencies.Select(c => c.Code).ToList(),
                    t.Expenses.Count,
                    decimal.Round(t.Expenses.Sum(e => AmountEur(e, rates)), 2));
            })
            .ToList();
    }

    public async Task<TripDetailDto?> GetDetailAsync(int id, int userId)
    {
        var trip = await trips.GetDetailAsync(id, userId);
        return trip is null ? null : ToDetail(trip);
    }

    public async Task<TripDetailDto> CreateAsync(int userId, SaveTripRequest request)
    {
        var name = ValidateName(request.Name);
        var currencies = ValidateCurrencies(request.Currencies);
        var trip = await trips.AddAsync(new Trip
        {
            UserId = userId,
            Name = name,
            Destinations = (request.Destinations ?? "").Trim(),
            CreatedAt = DateTime.UtcNow,
            Currencies = currencies.Select(c => new TripCurrency { Code = c.Code, RateToEur = c.Rate }).ToList()
        });
        return (await GetDetailAsync(trip.Id, userId))!;
    }

    public async Task<TripDetailDto?> UpdateAsync(int id, int userId, SaveTripRequest request)
    {
        var trip = await trips.GetDetailAsync(id, userId);
        if (trip is null) return null;

        var name = ValidateName(request.Name);
        var currencies = ValidateCurrencies(request.Currencies);

        // No se puede quitar una moneda que ya tiene gastos (dejaría gastos sin tasa).
        var keptCodes = currencies.Select(c => c.Code).ToHashSet();
        var usedCodes = trip.Expenses.Select(e => e.CurrencyCode).ToHashSet();
        var orphaned = usedCodes.Where(c => !keptCodes.Contains(c)).ToList();
        if (orphaned.Count > 0)
            throw new ArgumentException($"No puedes quitar una moneda con gastos: {string.Join(", ", orphaned)}.");

        trip.Name = name;
        trip.Destinations = (request.Destinations ?? "").Trim();
        // Actualiza tasas de las existentes y añade las nuevas; borra solo las que no se usan.
        trip.Currencies.RemoveAll(c => !keptCodes.Contains(c.Code));
        foreach (var input in currencies)
        {
            var existing = trip.Currencies.FirstOrDefault(c => c.Code == input.Code);
            if (existing is null) trip.Currencies.Add(new TripCurrency { TripId = trip.Id, Code = input.Code, RateToEur = input.Rate });
            else existing.RateToEur = input.Rate;
        }
        await trips.UpdateAsync(trip);
        return ToDetail(trip);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var trip = await trips.GetDetailAsync(id, userId);
        if (trip is null) return false;
        await trips.DeleteAsync(trip);
        return true;
    }

    public async Task<TripDetailDto?> AddExpenseAsync(int tripId, int userId, SaveTripExpenseRequest request)
    {
        var trip = await trips.GetDetailAsync(tripId, userId);
        if (trip is null) return null;

        var (amount, code, category, date, receipt) = await ValidateExpenseAsync(trip, userId, request);
        await trips.AddExpenseAsync(new TripExpense
        {
            UserId = userId,
            TripId = tripId,
            Amount = amount,
            CurrencyCode = code,
            CategoryId = category?.Id,
            Description = CleanDescription(request.Description, category?.Name),
            Date = date,
            ReceiptDataUrl = receipt
        });
        return (await GetDetailAsync(tripId, userId))!;
    }

    public async Task<TripDetailDto?> UpdateExpenseAsync(int tripId, int expenseId, int userId, SaveTripExpenseRequest request)
    {
        var trip = await trips.GetDetailAsync(tripId, userId);
        if (trip is null) return null;
        var expense = await trips.GetExpenseAsync(tripId, expenseId, userId);
        if (expense is null) return null;

        var (amount, code, category, date, receipt) = await ValidateExpenseAsync(trip, userId, request);
        expense.Amount = amount;
        expense.CurrencyCode = code;
        expense.CategoryId = category?.Id;
        expense.Description = CleanDescription(request.Description, category?.Name);
        expense.Date = date;
        // ReceiptDataUrl: "" explícito borra la factura; null la deja como estaba.
        if (request.ReceiptDataUrl is not null)
            expense.ReceiptDataUrl = request.ReceiptDataUrl.Length == 0 ? null : receipt;
        await trips.UpdateExpenseAsync(expense);
        return (await GetDetailAsync(tripId, userId))!;
    }

    public async Task<bool> DeleteExpenseAsync(int tripId, int expenseId, int userId)
    {
        var expense = await trips.GetExpenseAsync(tripId, expenseId, userId);
        if (expense is null) return false;
        await trips.DeleteExpenseAsync(expense);
        return true;
    }

    public async Task<string?> GetReceiptAsync(int tripId, int expenseId, int userId) =>
        (await trips.GetExpenseAsync(tripId, expenseId, userId))?.ReceiptDataUrl;

    // ---- Validación ----

    private async Task<(decimal amount, string code, Category? category, DateOnly date, string? receipt)>
        ValidateExpenseAsync(Trip trip, int userId, SaveTripExpenseRequest request)
    {
        if (request.Amount <= 0)
            throw new ArgumentException("El importe debe ser mayor que cero.");
        if (request.Amount > 1_000_000_000m)
            throw new ArgumentException("El importe es demasiado grande.");

        var code = (request.CurrencyCode ?? "").Trim().ToUpperInvariant();
        if (!trip.Currencies.Any(c => c.Code == code))
            throw new ArgumentException("La moneda no pertenece a este viaje.");

        Category? category = null;
        if (request.CategoryId is int cid)
            category = await categories.GetByIdAsync(cid, userId)
                ?? throw new ArgumentException("Categoría no encontrada.");

        var date = ExpenseService.ValidateDate(request.Date ?? DateOnly.FromDateTime(DateTime.Today));
        var receipt = ValidateReceipt(request.ReceiptDataUrl);
        return (decimal.Round(request.Amount, 2), code, category, date, receipt);
    }

    private static string ValidateName(string? name)
    {
        var trimmed = name?.Trim() ?? "";
        if (trimmed.Length == 0)
            throw new ArgumentException("El nombre del viaje es obligatorio.");
        if (trimmed.Length > MaxNameLength)
            throw new ArgumentException($"El nombre no puede superar {MaxNameLength} caracteres.");
        return trimmed;
    }

    private static List<(string Code, decimal Rate)> ValidateCurrencies(List<TripCurrencyInput>? input)
    {
        if (input is null || input.Count == 0)
            throw new ArgumentException("Añade al menos una moneda.");
        var result = new List<(string, decimal)>();
        var seen = new HashSet<string>();
        foreach (var c in input)
        {
            var code = (c.Code ?? "").Trim().ToUpperInvariant();
            if (code.Length == 0) throw new ArgumentException("El código de la moneda es obligatorio.");
            if (code.Length > MaxCurrencyCodeLength)
                throw new ArgumentException($"El código de moneda no puede superar {MaxCurrencyCodeLength} caracteres.");
            if (!seen.Add(code)) throw new ArgumentException($"Moneda repetida: {code}.");
            if (c.RateToEur <= 0) throw new ArgumentException($"La tasa de {code} debe ser mayor que cero.");
            result.Add((code, decimal.Round(c.RateToEur, 6)));
        }
        return result;
    }

    private static string? ValidateReceipt(string? dataUrl)
    {
        if (string.IsNullOrEmpty(dataUrl)) return null;
        if (!dataUrl.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("La factura debe ser una imagen.");
        if (dataUrl.Length > MaxReceiptLength)
            throw new ArgumentException("La imagen de la factura es demasiado grande.");
        return dataUrl;
    }

    private static string CleanDescription(string? description, string? fallback) =>
        ExpenseService.CleanDescription(description, string.IsNullOrWhiteSpace(fallback) ? "Gasto" : fallback);

    // ---- Mapeo / resumen ----

    private static Dictionary<string, decimal> RateMap(IEnumerable<TripCurrency> currencies) =>
        currencies.ToDictionary(c => c.Code, c => c.RateToEur);

    private static decimal AmountEur(TripExpense e, Dictionary<string, decimal> rates) =>
        e.Amount * rates.GetValueOrDefault(e.CurrencyCode, 0m);

    private static TripDetailDto ToDetail(Trip trip)
    {
        var rates = RateMap(trip.Currencies);

        var expenses = trip.Expenses
            .OrderByDescending(e => e.Date).ThenByDescending(e => e.Id)
            .Select(e => new TripExpenseDto(
                e.Id, e.Description, e.Amount, e.CurrencyCode, decimal.Round(AmountEur(e, rates), 2),
                e.Category is null ? null : new CategoryDto(e.Category.Id, e.Category.Name, e.Category.Icon, e.Category.Color),
                e.Date, e.ReceiptDataUrl is not null))
            .ToList();

        var byCurrency = trip.Currencies
            .Select(c =>
            {
                var group = trip.Expenses.Where(e => e.CurrencyCode == c.Code).ToList();
                return new CurrencyTotalDto(c.Code, c.RateToEur,
                    decimal.Round(group.Sum(e => e.Amount), 2),
                    decimal.Round(group.Sum(e => e.Amount * c.RateToEur), 2));
            })
            .OrderByDescending(c => c.TotalEur)
            .ToList();

        var placeholder = new CategoryDto(0, "Sin categoría", "🏷️", "#8e8e93");
        var byCategory = trip.Expenses
            .GroupBy(e => e.CategoryId)
            .Select(g =>
            {
                var cat = g.First().Category;
                var dto = cat is null ? placeholder : new CategoryDto(cat.Id, cat.Name, cat.Icon, cat.Color);
                return new CategoryTotalDto(dto, decimal.Round(g.Sum(e => AmountEur(e, rates)), 2));
            })
            .OrderByDescending(c => c.Total)
            .ToList();

        var summary = new TripSummaryDto(
            decimal.Round(trip.Expenses.Sum(e => AmountEur(e, rates)), 2),
            trip.Expenses.Count, byCurrency, byCategory);

        return new TripDetailDto(
            trip.Id, trip.Name, trip.Destinations,
            trip.Currencies.Select(c => new TripCurrencyDto(c.Code, c.RateToEur)).ToList(),
            summary, expenses);
    }
}
