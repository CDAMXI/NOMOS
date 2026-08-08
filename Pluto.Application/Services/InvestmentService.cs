using Pluto.Application.Common;
using Pluto.Application.DTOs;
using Pluto.Application.Interfaces;
using Pluto.Domain.Entities;

namespace Pluto.Application.Services;

/// <summary>
/// Operaciones de la cuenta broker: comprar/vender lotes de acciones y mover dinero entre el
/// margen libre y una cuenta de efectivo. El Balance de una cuenta Investment ES el margen libre;
/// las posiciones se valoran a precio de compra (la ganancia solo se materializa al vender).
/// </summary>
public class InvestmentService(
    IAccountRepository accounts, IHoldingRepository holdings,
    IExpenseRepository expenses, IIncomeRepository incomes, SnapshotWriter snapshotWriter,
    IUnitOfWork unitOfWork)
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

        ValidateLot(request.Symbol, request.Shares, request.Price);

        var cost = decimal.Round(request.Shares * request.Price, 2);
        if (cost > broker.Balance)
            throw new ArgumentException($"Margen libre insuficiente: la compra cuesta {cost:0.##} € y tienes {broker.Balance:0.##} €.");

        // El total del broker no cambia (el dinero pasa de margen a posiciones), pero el lote y
        // el margen no pueden divergir: van en la misma transacción.
        await CommitAsync(userId, broker, async () =>
        {
            await holdings.AddAsync(new Holding
            {
                UserId = userId,
                AccountId = accountId,
                Symbol = request.Symbol.Trim(),
                Shares = request.Shares,
                BuyPrice = request.Price,
                BuyDate = request.BuyDate ?? AppClock.Today() // sin fecha explícita: hoy
            });
            broker.Balance -= cost;
        });
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

        await CommitAsync(userId, broker, async () =>
        {
            // Lo vendido entra al margen a precio de venta; ahí se materializa la ganancia o pérdida.
            broker.Balance += decimal.Round(request.Shares * request.Price, 2);
            lot.Shares -= request.Shares;
            if (lot.Shares == 0) await holdings.DeleteAsync(lot);
            else await holdings.UpdateAsync(lot);
        });
        return await ToDtoAsync(broker, userId);
    }

    /// <summary>
    /// Corrige una compra registrada con error (símbolo, cantidad, precio o fecha), como si se
    /// hubiera anotado bien desde el principio: el margen libre absorbe la diferencia de coste
    /// (una compra corregida al alza descuenta más margen; a la baja, lo devuelve).
    /// </summary>
    public async Task<BrokerDto?> UpdateHoldingAsync(int accountId, int userId, int holdingId, UpdateHoldingRequest request)
    {
        var broker = await GetBrokerAsync(accountId, userId);
        if (broker is null) return null;

        var lot = await holdings.GetByIdAsync(holdingId, userId);
        if (lot is null || lot.AccountId != accountId) return null;

        ValidateLot(request.Symbol, request.Shares, request.Price);

        var oldCost = decimal.Round(lot.Shares * lot.BuyPrice, 2);
        var newCost = decimal.Round(request.Shares * request.Price, 2);
        var delta = newCost - oldCost;
        if (delta > broker.Balance)
            throw new ArgumentException($"Margen libre insuficiente: la corrección necesita {delta:0.##} € más y tienes {broker.Balance:0.##} €.");

        await CommitAsync(userId, broker, async () =>
        {
            lot.Symbol = request.Symbol.Trim();
            lot.Shares = request.Shares;
            lot.BuyPrice = request.Price;
            if (request.BuyDate is DateOnly d) lot.BuyDate = d;
            broker.Balance -= delta;
            await holdings.UpdateAsync(lot);
        });
        return await ToDtoAsync(broker, userId);
    }

    /// <summary>
    /// Deshace una compra registrada por error: elimina el lote y devuelve su coste íntegro
    /// al margen libre, como si la compra nunca se hubiera anotado.
    /// </summary>
    public async Task<BrokerDto?> DeleteHoldingAsync(int accountId, int userId, int holdingId)
    {
        var broker = await GetBrokerAsync(accountId, userId);
        if (broker is null) return null;

        var lot = await holdings.GetByIdAsync(holdingId, userId);
        if (lot is null || lot.AccountId != accountId) return null;

        await CommitAsync(userId, broker, async () =>
        {
            broker.Balance += decimal.Round(lot.Shares * lot.BuyPrice, 2);
            await holdings.DeleteAsync(lot);
        });
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

        // Los dos saldos (efectivo y broker) se mueven juntos o no se mueven.
        await CommitAsync(userId, broker, async () =>
        {
            cash.UpdatedAt = DateTime.UtcNow;
            await accounts.UpdateAsync(cash);
        });
        return await ToDtoAsync(broker, userId);
    }

    /// <summary>
    /// Reglas comunes de un lote: nombre obligatorio y cantidad y precio positivos. Recibe
    /// primitivos porque comprar y corregir traen tipos de petición distintos.
    /// </summary>
    private static void ValidateLot(string? symbol, decimal shares, decimal price)
    {
        if (string.IsNullOrWhiteSpace(symbol))
            throw new ArgumentException("El nombre de la acción es obligatorio.");
        if (shares <= 0 || price <= 0)
            throw new ArgumentException("El precio y la cantidad deben ser mayores que cero.");
    }

    /// <summary>
    /// Aplica los cambios de una operación y su epílogo en UNA transacción: sella el broker, lo
    /// persiste y refresca el snapshot. O va todo, o no va nada.
    /// </summary>
    private Task CommitAsync(int userId, Account broker, Func<Task> changes) =>
        unitOfWork.InTransactionAsync(async () =>
        {
            await changes();
            broker.UpdatedAt = DateTime.UtcNow;
            await accounts.UpdateAsync(broker);
            await snapshotWriter.RefreshAsync(userId, AppClock.Today());
        });

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

}
