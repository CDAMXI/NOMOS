using Nomos.Application.DTOs;
using Nomos.Application.Interfaces;
using Nomos.Domain.Entities;

namespace Nomos.Application.Services;

public class NetWorthService(IAccountRepository accounts, ISnapshotRepository snapshots, ExpenseService expenseService)
{
    public async Task<NetWorthDto> GetOverviewAsync(int userId, DateOnly today)
    {
        var all = await accounts.GetAllAsync(userId);
        // The Gastos available balance counts as liquid cash, so it folds into assets/net worth.
        var availableBalance = await expenseService.GetBalanceAsync(userId);
        var accountAssets = all.Where(a => a.Type != AccountType.Liability).Sum(a => a.Balance);
        var assets = accountAssets + availableBalance;
        var liabilities = all.Where(a => a.Type == AccountType.Liability).Sum(a => a.Balance);
        var net = assets - liabilities;

        var yearStart = new DateOnly(today.Year, 1, 1);
        var history = await snapshots.GetFromAsync(userId, yearStart);
        var series = history
            .OrderBy(s => s.Date)
            .Select(s => new SeriesPointDto(s.Date, s.Net))
            .ToList();

        // The live position is always the last point of the chart.
        if (series.Count == 0 || series[^1].Date < today)
            series.Add(new SeriesPointDto(today, net));
        else
            series[^1] = new SeriesPointDto(today, net);

        double? yearDeltaPct = series.Count > 1 && series[0].Value != 0
            ? (double)((net - series[0].Value) / Math.Abs(series[0].Value) * 100)
            : null;

        var accountDtos = all
            .OrderBy(a => a.Type).ThenBy(a => a.Id)
            .Select(ToDto).ToList();

        return new NetWorthDto(net, assets, liabilities, availableBalance, yearDeltaPct, series, accountDtos);
    }

    public async Task<AccountDto> CreateAsync(int userId, CreateAccountRequest request, DateOnly today)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("El nombre es obligatorio.");
        if (request.Balance < 0)
            throw new ArgumentException("El saldo no puede ser negativo.");

        var account = await accounts.AddAsync(new Account
        {
            UserId = userId,
            Name = request.Name.Trim(),
            Type = ParseType(request.Type),
            Balance = decimal.Round(request.Balance, 2),
            UpdatedAt = DateTime.UtcNow
        });
        await RefreshSnapshotAsync(userId, today);
        return ToDto(account);
    }

    public async Task<AccountDto?> UpdateAsync(int id, int userId, UpdateAccountRequest request, DateOnly today)
    {
        var account = await accounts.GetByIdAsync(id, userId);
        if (account is null) return null;
        if (request.Balance < 0)
            throw new ArgumentException("El saldo no puede ser negativo.");

        if (!string.IsNullOrWhiteSpace(request.Name))
            account.Name = request.Name.Trim();
        account.Balance = decimal.Round(request.Balance, 2);
        account.UpdatedAt = DateTime.UtcNow;
        await accounts.UpdateAsync(account);
        await RefreshSnapshotAsync(userId, today);
        return ToDto(account);
    }

    public async Task<bool> DeleteAsync(int id, int userId, DateOnly today)
    {
        var account = await accounts.GetByIdAsync(id, userId);
        if (account is null) return false;
        await accounts.DeleteAsync(account);
        await RefreshSnapshotAsync(userId, today);
        return true;
    }

    /// <summary>Keeps the user's current-month snapshot in sync with their live account totals.</summary>
    private async Task RefreshSnapshotAsync(int userId, DateOnly today)
    {
        var all = await accounts.GetAllAsync(userId);
        await snapshots.UpsertAsync(new NetWorthSnapshot
        {
            UserId = userId,
            Date = today,
            Assets = all.Where(a => a.Type != AccountType.Liability).Sum(a => a.Balance),
            Liabilities = all.Where(a => a.Type == AccountType.Liability).Sum(a => a.Balance)
        });
    }

    private static AccountType ParseType(string type) =>
        Enum.TryParse<AccountType>(type, ignoreCase: true, out var parsed)
            ? parsed
            : throw new ArgumentException($"Tipo de cuenta no válido: {type}");

    private static AccountDto ToDto(Account a) =>
        new(a.Id, a.Name, a.Type.ToString(), a.Balance, a.UpdatedAt);
}
