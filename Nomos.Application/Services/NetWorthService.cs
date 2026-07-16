using Nomos.Application.Common;
using Nomos.Application.DTOs;
using Nomos.Application.Interfaces;
using Nomos.Domain.Entities;

namespace Nomos.Application.Services;

public class NetWorthService(
    IAccountRepository accounts, ISnapshotRepository snapshots,
    IExpenseRepository expenses, IIncomeRepository incomes, IHoldingRepository holdings)
{
    public async Task<NetWorthDto> GetOverviewAsync(int userId, DateOnly today)
    {
        var all = await accounts.GetAllAsync(userId);
        var live = AccountBalances.Live(all,
            await expenses.GetAllAsync(userId), await incomes.GetAllAsync(userId), await holdings.GetAllAsync(userId));
        var assets = all.Where(a => a.Type != AccountType.Liability).Sum(a => live[a.Id]);
        var liabilities = all.Where(a => a.Type == AccountType.Liability).Sum(a => live[a.Id]);
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
            .Select(a => ToDto(a, live[a.Id])).ToList();

        return new NetWorthDto(net, assets, liabilities, yearDeltaPct, series, accountDtos);
    }

    /// <summary>Every new user starts with an "Efectivo" cash account so movements have somewhere to go.</summary>
    public async Task SeedDefaultAccountAsync(int userId) =>
        await accounts.AddAsync(new Account
        {
            UserId = userId,
            Name = "Efectivo",
            Type = AccountType.Cash,
            Balance = 0m,
            UpdatedAt = DateTime.UtcNow
        });

    public async Task<AccountDto> CreateAsync(int userId, CreateAccountRequest request, DateOnly today)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("El nombre es obligatorio.");

        // No movements yet, so the entered balance is both the baseline and the live balance.
        var balance = decimal.Round(request.Balance, 2);
        var account = await accounts.AddAsync(new Account
        {
            UserId = userId,
            Name = request.Name.Trim(),
            Type = ParseType(request.Type),
            Balance = balance,
            UpdatedAt = DateTime.UtcNow
        });
        await RefreshSnapshotAsync(userId, today);
        return ToDto(account, balance);
    }

    public async Task<AccountDto?> UpdateAsync(int id, int userId, UpdateAccountRequest request, DateOnly today)
    {
        var account = await accounts.GetByIdAsync(id, userId);
        if (account is null) return null;

        if (!string.IsNullOrWhiteSpace(request.Name))
            account.Name = request.Name.Trim();
        // The entered value is the account's CURRENT balance; store the baseline that produces it.
        var target = decimal.Round(request.Balance, 2);
        account.Balance = target - await AccountFlowAsync(userId, id);
        account.UpdatedAt = DateTime.UtcNow;
        await accounts.UpdateAsync(account);
        await RefreshSnapshotAsync(userId, today);
        return ToDto(account, target);
    }

    public async Task<bool> DeleteAsync(int id, int userId, DateOnly today)
    {
        var account = await accounts.GetByIdAsync(id, userId);
        if (account is null) return false;
        await accounts.DeleteAsync(account);
        await RefreshSnapshotAsync(userId, today);
        return true;
    }

    /// <summary>Net movement (incomes − expenses) assigned to a single account.</summary>
    private async Task<decimal> AccountFlowAsync(int userId, int accountId)
    {
        var inc = (await incomes.GetAllAsync(userId)).Where(i => i.AccountId == accountId).Sum(i => i.Amount);
        var exp = (await expenses.GetAllAsync(userId)).Where(e => e.AccountId == accountId).Sum(e => e.Amount);
        return inc - exp;
    }

    /// <summary>Keeps the user's current-month snapshot in sync with their live account totals.</summary>
    private async Task RefreshSnapshotAsync(int userId, DateOnly today)
    {
        var all = await accounts.GetAllAsync(userId);
        var live = AccountBalances.Live(all,
            await expenses.GetAllAsync(userId), await incomes.GetAllAsync(userId), await holdings.GetAllAsync(userId));
        await snapshots.UpsertAsync(new NetWorthSnapshot
        {
            UserId = userId,
            Date = today,
            Assets = all.Where(a => a.Type != AccountType.Liability).Sum(a => live[a.Id]),
            Liabilities = all.Where(a => a.Type == AccountType.Liability).Sum(a => live[a.Id])
        });
    }

    private static AccountType ParseType(string type) =>
        Enum.TryParse<AccountType>(type, ignoreCase: true, out var parsed)
            ? parsed
            : throw new ArgumentException($"Tipo de cuenta no válido: {type}");

    private static AccountDto ToDto(Account a, decimal liveBalance) =>
        new(a.Id, a.Name, a.Type.ToString(), liveBalance, a.UpdatedAt);
}
