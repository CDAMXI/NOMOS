using Nomos.Application.Common;
using Nomos.Application.Interfaces;
using Nomos.Domain.Entities;

namespace Nomos.Application.Services;

/// <summary>
/// Punto único para recalcular el snapshot mensual de patrimonio de un usuario a partir de sus
/// saldos vivos (cuentas + movimientos + holdings). Lo comparten NetWorthService e InvestmentService
/// para no duplicar el cómputo de activos/pasivos.
/// </summary>
public class SnapshotWriter(
    IAccountRepository accounts, ISnapshotRepository snapshots,
    IExpenseRepository expenses, IIncomeRepository incomes, IHoldingRepository holdings)
{
    public async Task RefreshAsync(int userId, DateOnly today)
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
}
