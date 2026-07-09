using System.Globalization;
using Nomos.Application.DTOs;
using Nomos.Application.Interfaces;
using Nomos.Domain.Entities;

namespace Nomos.Application.Services;

public class ExpenseService(IExpenseRepository expenses, IIncomeRepository incomes, ICategoryRepository categories)
{
    internal const int MaxDescriptionLength = 120;
    private static readonly CultureInfo Spanish = CultureInfo.GetCultureInfo("es-ES");

    public async Task<List<CategoryDto>> GetCategoriesAsync(int userId) =>
        (await categories.GetAllAsync(userId)).Select(ToDto).ToList();

    /// <summary>All the user's movements (expenses + incomes) merged, newest first.</summary>
    public async Task<List<TransactionDto>> GetTransactionsAsync(int userId)
    {
        var all = (await expenses.GetAllAsync(userId)).Select(ToTx)
            .Concat((await incomes.GetAllAsync(userId)).Select(ToTx));
        return all.OrderByDescending(t => t.Date).ThenByDescending(t => t.Id).ToList();
    }

    public async Task<ExpenseDto> CreateAsync(int userId, CreateExpenseRequest request, DateOnly today)
    {
        ValidateAmount(request.Amount);
        var category = await categories.GetByIdAsync(request.CategoryId, userId)
            ?? throw new ArgumentException("Categoría no encontrada.");

        var expense = await expenses.AddAsync(new Expense
        {
            UserId = userId,
            Amount = decimal.Round(request.Amount, 2),
            CategoryId = category.Id,
            Description = CleanDescription(request.Description, category.Name),
            Date = ValidateDate(request.Date ?? today)
        });
        expense.Category = category;
        return ToDto(expense);
    }

    public async Task<ExpenseDto?> UpdateAsync(int id, int userId, UpdateExpenseRequest request)
    {
        var expense = await expenses.GetByIdAsync(id, userId);
        if (expense is null) return null;
        ValidateAmount(request.Amount);

        var category = await categories.GetByIdAsync(request.CategoryId, userId)
            ?? throw new ArgumentException("Categoría no encontrada.");

        expense.Amount = decimal.Round(request.Amount, 2);
        expense.CategoryId = category.Id;
        expense.Description = CleanDescription(request.Description, category.Name);
        expense.Date = ValidateDate(request.Date);
        await expenses.UpdateAsync(expense);
        expense.Category = category;
        return ToDto(expense);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var expense = await expenses.GetByIdAsync(id, userId);
        if (expense is null) return false;
        await expenses.DeleteAsync(expense);
        return true;
    }

    public async Task<ExpensesDashboardDto> GetDashboardAsync(int userId, int windowDays, DateOnly today)
    {
        var monthStart = new DateOnly(today.Year, today.Month, 1);
        var prevMonthStart = monthStart.AddMonths(-1);
        var windowStart = today.AddDays(-(windowDays - 1));
        var from = windowStart < prevMonthStart ? windowStart : prevMonthStart;

        var items = await expenses.GetBetweenAsync(userId, from, today);
        var incomeItems = await incomes.GetBetweenAsync(userId, from, today);

        var monthTotal = items.Where(e => e.Date >= monthStart).Sum(e => e.Amount);
        var prevMonthTotal = items.Where(e => e.Date >= prevMonthStart && e.Date < monthStart).Sum(e => e.Amount);
        double? deltaPct = prevMonthTotal > 0
            ? (double)((monthTotal - prevMonthTotal) / prevMonthTotal * 100)
            : null;

        var monthIncome = incomeItems.Where(i => i.Date >= monthStart).Sum(i => i.Amount);

        var inWindow = items.Where(e => e.Date >= windowStart).ToList();

        // Cumulative daily spend across the window (what the evolution chart plots).
        var byDay = inWindow.GroupBy(e => e.Date).ToDictionary(g => g.Key, g => g.Sum(e => e.Amount));
        var series = new List<SeriesPointDto>(windowDays);
        decimal running = 0;
        for (var d = windowStart; d <= today; d = d.AddDays(1))
        {
            running += byDay.GetValueOrDefault(d);
            series.Add(new SeriesPointDto(d, running));
        }

        var byCategory = inWindow
            .GroupBy(e => e.CategoryId)
            .Select(g => new CategoryTotalDto(ToDto(g.First().Category!), g.Sum(e => e.Amount)))
            .OrderByDescending(c => c.Total)
            .ToList();

        var recent = items.Select(ToTx)
            .Concat(incomeItems.Select(ToTx))
            .OrderByDescending(t => t.Date).ThenByDescending(t => t.Id)
            .Take(8).ToList();

        return new ExpensesDashboardDto(
            MonthLabel: Capitalize(monthStart.ToString("MMMM yyyy", Spanish)),
            PrevMonthLabel: prevMonthStart.ToString("MMMM", Spanish),
            MonthTotal: monthTotal,
            PrevMonthTotal: prevMonthTotal,
            DeltaPct: deltaPct,
            MonthIncome: monthIncome,
            Series: series,
            ByCategory: byCategory,
            Recent: recent);
    }

    private static void ValidateAmount(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("El importe debe ser mayor que cero.");
        if (amount > 100_000_000m)
            throw new ArgumentException("El importe es demasiado grande.");
    }

    internal static DateOnly ValidateDate(DateOnly date)
    {
        if (date.Year < 2000 || date.Year > 2100)
            throw new ArgumentException("La fecha no es válida.");
        return date;
    }

    internal static string CleanDescription(string? description, string fallback)
    {
        var text = string.IsNullOrWhiteSpace(description) ? fallback : description.Trim();
        if (text.Length > MaxDescriptionLength)
            throw new ArgumentException($"La descripción no puede superar {MaxDescriptionLength} caracteres.");
        return text;
    }

    private static string Capitalize(string s) =>
        s.Length == 0 ? s : char.ToUpper(s[0], Spanish) + s[1..];

    private static CategoryDto ToDto(Category c) => new(c.Id, c.Name, c.Icon, c.Color);

    private static ExpenseDto ToDto(Expense e) =>
        new(e.Id, e.Description, e.Amount, e.Date, ToDto(e.Category!));

    private static TransactionDto ToTx(Expense e) =>
        new(e.Id, "expense", e.Description, e.Amount, e.Date, ToDto(e.Category!));

    private static TransactionDto ToTx(Income i) =>
        new(i.Id, "income", i.Description, i.Amount, i.Date, null);
}
