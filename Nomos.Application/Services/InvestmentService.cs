using Nomos.Application.Common;
using Nomos.Application.DTOs;
using Nomos.Application.Interfaces;
using Nomos.Domain.Entities;

namespace Nomos.Application.Services;

/// <summary>
/// Operaciones de la cuenta broker: comprar/vender lotes de acciones y mover dinero entre el
/// margen libre y una cuenta de efectivo. El Balance de una cuenta Investment ES el margen libre;
/// las posiciones se valoran a precio de compra (la ganancia solo se materializa al vender).
/// </summary>
public class InvestmentService(
    IAccountRepository accounts, IHoldingRepository holdings,
    ISnapshotRepository snapshots, IExpenseRepository expenses, IIncomeRepository incomes)
{
    public async Task<BrokerDto?> GetAsync(int accountId, int userId)
    {
        var broker = await GetBrokerAsync(accountId, userId);
        if (broker is null) return null;
        return await ToDtoAsync(broker, userId);
    }

    public async Task<BrokerDto?> BuyAsync(int accountId, int userId, BuyRequest request)
    {
        var broker = await GetBrokerAsync(accountId, userId);
        if (broker is null) return null;

        if (string.IsNullOrWhiteSpace(request.Symbol))
            throw new ArgumentException("El nombre de la acción es obligatorio.");
        if (request.Shares <= 0 || request.Price <= 0)
            throw new ArgumentException("El precio y la cantidad deben ser mayores que cero.");

        var cost = decimal.Round(request.Shares * request.Price, 2);
        if (cost > broker.Balance)
            throw new ArgumentException($"Margen libre insuficiente: la compra cuesta {cost:0.##} € y tienes {broker.Balance:0.##} €.");

        await holdings.AddAsync(new Holding
        {
            UserId = userId,
            AccountId = accountId,
            Symbol = request.Symbol.Trim(),
            Shares = request.Shares,
            BuyPrice = request.Price,
            BuyDate = DateOnly.FromDateTime(DateTime.Today)
        });
        broker.Balance -= cost;
        broker.UpdatedAt = DateTime.UtcNow;
        await accounts.UpdateAsync(broker);
        // El total del broker no cambia (margen → posiciones), pero mantenemos el snapshot fresco.
        await RefreshSnapshotAsync(userId);
        return await ToDtoAsync(broker, userId);
    }

    public async Task<BrokerDto?> SellAsync(int accountId, int userId, SellRequest request)
    {
        var broker = await GetBrokerAsync(accountId, userId);
        if (broker is null) return null;

        var lot = await holdings.GetByIdAsync(request.HoldingId, userId);
        if (lot is null || lot.AccountId != accountId) return null;

        if (request.Shares <= 0)
            throw new ArgumentException("La cantidad debe ser mayor que cero.");
        if (request.Shares > lot.Shares)
            throw new ArgumentException($"No puedes vender más acciones de las que tienes ({lot.Shares:0.####}).");
        if (request.Price <= 0)
            throw new ArgumentException("El precio de venta debe ser mayor que cero.");

        // Lo vendido entra al margen a precio de venta; ahí se materializa la ganancia o pérdida.
        broker.Balance += decimal.Round(request.Shares * request.Price, 2);
        broker.UpdatedAt = DateTime.UtcNow;

        lot.Shares -= request.Shares;
        if (lot.Shares == 0) await holdings.DeleteAsync(lot);
        else await holdings.UpdateAsync(lot);
        await accounts.UpdateAsync(broker);
        await RefreshSnapshotAsync(userId);
        return await ToDtoAsync(broker, userId);
    }

    public async Task<BrokerDto?> TransferAsync(int accountId, int userId, BrokerTransferRequest request)
    {
        var broker = await GetBrokerAsync(accountId, userId);
        if (broker is null) return null;

        var cash = await accounts.GetByIdAsync(request.CashAccountId, userId);
        if (cash is null || cash.Type != AccountType.Cash)
            throw new ArgumentException("Elige una cuenta de efectivo válida.");
        if (request.Amount <= 0)
            throw new ArgumentException("La cantidad debe ser mayor que cero.");

        var amount = decimal.Round(request.Amount, 2);
        var deposit = request.Direction?.ToLowerInvariant() switch
        {
            "deposit" => true,
            "withdraw" => false,
            _ => throw new ArgumentException("Dirección no válida (deposit/withdraw).")
        };

        if (deposit)
        {
            // El saldo vivo de la cuenta de efectivo incluye sus movimientos; no puede quedar en negativo.
            var live = AccountBalances.Live([cash], await expenses.GetAllAsync(userId), await incomes.GetAllAsync(userId));
            if (amount > live[cash.Id])
                throw new ArgumentException($"Saldo insuficiente en {cash.Name}: tienes {live[cash.Id]:0.##} €.");
            cash.Balance -= amount;
            broker.Balance += amount;
        }
        else
        {
            if (amount > broker.Balance)
                throw new ArgumentException($"Margen libre insuficiente: tienes {broker.Balance:0.##} €.");
            broker.Balance -= amount;
            cash.Balance += amount;
        }

        cash.UpdatedAt = broker.UpdatedAt = DateTime.UtcNow;
        await accounts.UpdateAsync(cash);
        await accounts.UpdateAsync(broker);
        await RefreshSnapshotAsync(userId);
        return await ToDtoAsync(broker, userId);
    }

    private async Task<Account?> GetBrokerAsync(int accountId, int userId)
    {
        var account = await accounts.GetByIdAsync(accountId, userId);
        return account?.Type == AccountType.Investment ? account : null;
    }

    private async Task<BrokerDto> ToDtoAsync(Account broker, int userId)
    {
        var lots = (await holdings.GetByAccountAsync(broker.Id, userId))
            .OrderBy(h => h.Symbol).ThenBy(h => h.BuyDate).ThenBy(h => h.Id)
            .Select(h => new HoldingDto(h.Id, h.Symbol, h.Shares, h.BuyPrice, decimal.Round(h.Shares * h.BuyPrice, 2), h.BuyDate))
            .ToList();
        var invested = lots.Sum(h => h.Cost);
        return new BrokerDto(broker.Id, broker.Name, broker.Balance, invested, broker.Balance + invested, lots);
    }

    /// <summary>Mismo criterio que NetWorthService: el snapshot del mes refleja los totales vivos.</summary>
    private async Task RefreshSnapshotAsync(int userId)
    {
        var all = await accounts.GetAllAsync(userId);
        var live = AccountBalances.Live(all,
            await expenses.GetAllAsync(userId), await incomes.GetAllAsync(userId), await holdings.GetAllAsync(userId));
        await snapshots.UpsertAsync(new NetWorthSnapshot
        {
            UserId = userId,
            Date = DateOnly.FromDateTime(DateTime.Today),
            Assets = all.Where(a => a.Type != AccountType.Liability).Sum(a => live[a.Id]),
            Liabilities = all.Where(a => a.Type == AccountType.Liability).Sum(a => live[a.Id])
        });
    }
}
