using Pluto.Application.Common;
using Pluto.Application.DTOs;
using Pluto.Application.Interfaces;
using Pluto.Domain.Entities;

namespace Pluto.Application.Services;

public class ExpenseService(
    IExpenseRepository expenses, IIncomeRepository incomes,
    ICategoryRepository categories, IAccountRepository accounts)
{
    internal const int MaxDescriptionLength = 120;
    internal const decimal MaxAmount = 100_000_000m;
    // El dashboard manda hasta 20 recientes; el front enseña 8 y rellena hasta igualar columnas.
    internal const int RecentCount = 20;

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
        // El RESUMEN habla del mes natural (así se leen los gastos: el día 1 se ve solo lo
        // de hoy, porque el mes arranca — decisión de Charlie). La gráfica y la rueda siguen
        // la ventana móvil de sus pastillas (30/90 días).
        var monthStart = new DateOnly(today.Year, today.Month, 1);
        var windowStart = today.AddDays(-(windowDays - 1));
        var from = windowStart < monthStart ? windowStart : monthStart;

        var items = await expenses.GetBetweenAsync(userId, from, today);
        var incomeItems = await incomes.GetBetweenAsync(userId, from, today);
        var balance = await GetBalanceAsync(userId, accs);

        var inWindow = items.Where(e => e.Date >= windowStart).ToList();
        // La RUEDA reparte el gasto del MES natural, igual que el resumen del hero (la gráfica
        // es la que sigue la ventana móvil de sus pastillas).
        var inMonth = items.Where(e => e.Date >= monthStart).ToList();

        // El mismo reparto por categoría, pero separado por cuenta (la rueda por cuenta).
        var byAccount = inMonth
            .Where(e => e.AccountId != null)
            .GroupBy(e => e.AccountId!.Value)
            .Select(g => new AccountBreakdownDto(g.Key, TotalsByCategory(g)))
            .ToList();

        return new ExpensesDashboardDto(
            Balance: balance,
            MonthTotal: inMonth.Sum(e => e.Amount),
            MonthIncome: incomeItems.Where(i => i.Date >= monthStart).Sum(i => i.Amount),
            Series: CumulativeDailySpend(inWindow, windowStart, today),
            ByCategory: TotalsByCategory(inMonth),
            ByAccount: byAccount,
            Recent: RecentMovements(items, incomeItems, accs));
    }

    /// <summary>Reparto por categoría, de mayor a menor: lo que pinta la rueda.</summary>
    private static List<CategoryTotalDto> TotalsByCategory(IEnumerable<Expense> expenses) =>
        expenses
            .GroupBy(e => e.CategoryId)
            .Select(g => new CategoryTotalDto(ToDto(g.First().Category!), g.Sum(e => e.Amount)))
            .OrderByDescending(c => c.Total)
            .ToList();

    /// <summary>Gasto ACUMULADO día a día en la ventana: la curva que dibuja la gráfica.</summary>
    private static List<SeriesPointDto> CumulativeDailySpend(List<Expense> expenses, DateOnly from, DateOnly to)
    {
        var byDay = expenses.GroupBy(e => e.Date).ToDictionary(g => g.Key, g => g.Sum(e => e.Amount));
        var series = new List<SeriesPointDto>();
        decimal running = 0;
        for (var day = from; day <= to; day = day.AddDays(1))
        {
            running += byDay.GetValueOrDefault(day);
            series.Add(new SeriesPointDto(day, running));
        }
        return series;
    }

    /// <summary>Gastos e ingresos mezclados, los más recientes primero.</summary>
    private static List<TransactionDto> RecentMovements(
        List<Expense> expenses, List<Income> incomes, List<Account> accounts)
    {
        var names = accounts.ToDictionary(a => a.Id, a => a.Name);
        return expenses.Select(e => ToTx(e, names))
            .Concat(incomes.Select(i => ToTx(i, names)))
            .OrderByDescending(t => t.Date).ThenByDescending(t => t.Id)
            .Take(RecentCount).ToList();
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
