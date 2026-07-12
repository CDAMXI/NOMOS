using Nomos.Domain.Entities;

namespace Nomos.Application.Common;

public static class AccountBalances
{
    /// <summary>
    /// Live balance per account = its baseline balance + incomes deposited to it − expenses paid from it.
    /// Movements pointing at a non-existent/other account are ignored.
    /// </summary>
    public static Dictionary<int, decimal> Live(
        IEnumerable<Account> accounts, IEnumerable<Expense> expenses, IEnumerable<Income> incomes)
    {
        var balances = accounts.ToDictionary(a => a.Id, a => a.Balance);
        foreach (var i in incomes)
            if (i.AccountId is int aid && balances.ContainsKey(aid)) balances[aid] += i.Amount;
        foreach (var e in expenses)
            if (e.AccountId is int aid && balances.ContainsKey(aid)) balances[aid] -= e.Amount;
        return balances;
    }
}
