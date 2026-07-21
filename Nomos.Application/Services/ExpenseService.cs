using System.Globalization;
using Nomos.Application.Common;
using Nomos.Application.DTOs;
using Nomos.Application.Interfaces;
using Nomos.Domain.Entities;

namespace Nomos.Application.Services;

public class ExpenseService(
    IExpenseRepository expenses, IIncomeRepository incomes,
    ICategoryRepository categories, IAccountRepository accounts)
{
    internal const int MaxDescriptionLength = 120;
    internal const decimal MaxAmount = 100_000_000m;
    // El dashboard manda hasta 20 recientes; el front enseña 8 y rellena hasta igualar columnas.
    internal const int RecentCount = 20;
    private static readonly CultureInfo Spanish = CultureInfo.GetCultureInfo("es-ES");

    public async Task<List<CategoryDto>> GetCategoriesAsync(int userId) =>
        (await categories.GetAllAsync(userId)).Select(ToDto).ToList();

    /// <summary>Available balance = sum of the live balances of the user's cash (bank) accounts.</summary>
    public async Task<decimal> GetBalanceAsync(int userId) =>
        await GetBalanceAsync(userId, await accounts.GetAllAsync(userId));

    private async Task<decimal> GetBalanceAsync(int userId, List<Account> accs)
    {
        var live = AccountBalances.Live(accs, await expenses.GetAllAsync(userId), await incomes.GetAllAsync(userId));
        return accs.Where(a => a.Type == AccountType.Cash).Sum(a => live[a.Id]);
    }

    /// <summary>All the user's movements (expenses + incomes) merged, newest first.</summary>
    public async Task<List<TransactionDto>> GetTransactionsAsync(int userId)
    {
        var names = await AccountNamesAsync(userId);
        var all = (await expenses.GetAllAsync(userId)).Select(e => ToTx(e, names))
            .Concat((await incomes.GetAllAsync(userId)).Select(i => ToTx(i, names)));
        return all.OrderByDescending(t => t.Date).ThenByDescending(t => t.Id).ToList();
    }

    public async Task<ExpenseDto> CreateAsync(int userId, CreateExpenseRequest request, DateOnly today)
    {
        ValidateAmount(request.Amount);
        var category = await categories.GetByIdAsync(request.CategoryId, userId)
            ?? throw new ArgumentException("Categoría no encontrada.");
        var account = await MovementAccounts.ResolveAsync(accounts, userId, request.AccountId);

        var expense = await expenses.AddAsync(new Expense
        {
            UserId = userId,
            Amount = decimal.Round(request.Amount, 2),
            CategoryId = category.Id,
            Description = CleanDescription(request.Description, category.Name),
            Date = ValidateDate(request.Date ?? today),
            AccountId = account?.Id
        });
        expense.Category = category;
        return ToDto(expense, account?.Name);
    }

    public async Task<ExpenseDto?> UpdateAsync(int id, int userId, UpdateExpenseRequest request)
    {
        var expense = await expenses.GetByIdAsync(id, userId);
        if (expense is null) return null;
        ValidateAmount(request.Amount);
        var category = await categories.GetByIdAsync(request.CategoryId, userId)
            ?? throw new ArgumentException("Categoría no encontrada.");
        var account = await MovementAccounts.ResolveAsync(accounts, userId, request.AccountId);

        expense.Amount = decimal.Round(request.Amount, 2);
        expense.CategoryId = category.Id;
        expense.Description = CleanDescription(request.Description, category.Name);
        expense.Date = ValidateDate(request.Date);
        expense.AccountId = account?.Id;
        await expenses.UpdateAsync(expense);
        expense.Category = category;
        return ToDto(expense, account?.Name);
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
        var accs = await accounts.GetAllAsync(userId);
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
        var balance = await GetBalanceAsync(userId, accs);

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

        // Same breakdown but split per assigned account (for the per-account donut).
        var byAccount = inWindow
            .Where(e => e.AccountId != null)
            .GroupBy(e => e.AccountId!.Value)
            .Select(g => new AccountBreakdownDto(g.Key, g
                .GroupBy(e => e.CategoryId)
                .Select(cg => new CategoryTotalDto(ToDto(cg.First().Category!), cg.Sum(e => e.Amount)))
                .OrderByDescending(c => c.Total)
                .ToList()))
            .ToList();

        var names = accs.ToDictionary(a => a.Id, a => a.Name);
        var recent = items.Select(e => ToTx(e, names))
            .Concat(incomeItems.Select(i => ToTx(i, names)))
            .OrderByDescending(t => t.Date).ThenByDescending(t => t.Id)
            .Take(RecentCount).ToList();

        return new ExpensesDashboardDto(
            Balance: balance,
            MonthDate: monthStart,
            MonthLabel: Capitalize(monthStart.ToString("MMMM yyyy", Spanish)),
            PrevMonthLabel: prevMonthStart.ToString("MMMM", Spanish),
            MonthTotal: monthTotal,
            PrevMonthTotal: prevMonthTotal,
            DeltaPct: deltaPct,
            MonthIncome: monthIncome,
            Series: series,
            ByCategory: byCategory,
            ByAccount: byAccount,
            Recent: recent);
    }

    private async Task<Dictionary<int, string>> AccountNamesAsync(int userId) =>
        (await accounts.GetAllAsync(userId)).ToDictionary(a => a.Id, a => a.Name);

    internal static void ValidateAmount(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("El importe debe ser mayor que cero.");
        if (amount > MaxAmount)
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

    private static string? NameOf(int? id, Dictionary<int, string> names) =>
        id is int x && names.TryGetValue(x, out var n) ? n : null;

    private static CategoryDto ToDto(Category c) => new(c.Id, c.Name, c.Icon, c.Color);

    private static ExpenseDto ToDto(Expense e, string? accountName) =>
        new(e.Id, e.Description, e.Amount, e.Date, ToDto(e.Category!), e.AccountId, accountName);

    private static TransactionDto ToTx(Expense e, Dictionary<int, string> names) =>
        new(e.Id, "expense", e.Description, e.Amount, e.Date, ToDto(e.Category!), e.AccountId, NameOf(e.AccountId, names));

    private static TransactionDto ToTx(Income i, Dictionary<int, string> names) =>
        new(i.Id, "income", i.Description, i.Amount, i.Date, null, i.AccountId, NameOf(i.AccountId, names));
}
