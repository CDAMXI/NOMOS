using Nomos.Application.Interfaces;
using Nomos.Domain.Entities;

namespace Nomos.Application.Common;

public static class MovementAccounts
{
    /// <summary>Ensures the account (if any) belongs to the user and is a spendable cash/bank account.</summary>
    public static async Task<Account?> ResolveAsync(IAccountRepository accounts, int userId, int? accountId)
    {
        if (accountId is not int id) return null;
        var account = await accounts.GetByIdAsync(id, userId)
            ?? throw new ArgumentException("Cuenta no encontrada.");
        if (account.Type != AccountType.Cash)
            throw new ArgumentException("Solo puedes asignar movimientos a cuentas de efectivo o banco.");
        return account;
    }
}
