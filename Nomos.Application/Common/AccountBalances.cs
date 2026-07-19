using Nomos.Domain.Entities;

namespace Nomos.Application.Common;

public static class AccountBalances
{
    /// <summary>
    /// Live balance per account = its baseline balance + incomes deposited to it − expenses paid from it.
    /// For investment accounts the baseline is the free margin, so each holding adds its cost
    /// (shares × buy price) to reach the account's total value. Movements pointing at a
    /// non-existent/other account are ignored.
    /// </summary>
    public static Dictionary<int, decimal> Live(
        IEnumerable<Account> accounts, IEnumerable<Expense> expenses, IEnumerable<Income> incomes,
        IEnumerable<Holding>? holdings = null)
    {
        var balances = accounts.ToDictionary(a => a.Id, a => a.Balance);
        foreach (var i in incomes)
            if (i.AccountId is int aid && balances.ContainsKey(aid)) balances[aid] += i.Amount;
        foreach (var e in expenses)
            if (e.AccountId is int aid && balances.ContainsKey(aid)) balances[aid] -= e.Amount;
        if (holdings is not null)
            foreach (var h in holdings)
                if (balances.ContainsKey(h.AccountId)) balances[h.AccountId] += h.Shares * h.BuyPrice;
        return balances;
    }

    /// <summary>Splits the live balances into assets (every non-liability account) and liabilities.</summary>
    public static (decimal Assets, decimal Liabilities) SplitAssetsLiabilities(
        IEnumerable<Account> accounts, Dictionary<int, decimal> live) =>
        (accounts.Where(a => a.Type != AccountType.Liability).Sum(a => live[a.Id]),
         accounts.Where(a => a.Type == AccountType.Liability).Sum(a => live[a.Id]));
}
