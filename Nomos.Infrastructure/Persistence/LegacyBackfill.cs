using Microsoft.EntityFrameworkCore;
using Nomos.Domain.Entities;

namespace Nomos.Infrastructure.Persistence;

/// <summary>
/// One-time, idempotent migration for the multi-account feature. Users created before accounts
/// existed have no account at all, and their movements point at none. This gives each such user a
/// default "Efectivo" cash account seeded from their old <see cref="User.InitialBalance"/> (so their
/// available balance is preserved exactly) and attaches every un-assigned movement to it.
///
/// Gated on the presence of account-less users, so it runs exactly once: after the first pass every
/// user owns an account and the whole routine is skipped. This deliberately does NOT re-home
/// movements that later become orphaned by deleting an account (that is the intended SetNull behaviour).
/// </summary>
public static class LegacyBackfill
{
    public static async Task RunAsync(NomosDbContext db)
    {
        var accountlessUsers = await db.Users
            .Where(u => !db.Accounts.Any(a => a.UserId == u.Id))
            .ToListAsync();
        if (accountlessUsers.Count == 0) return; // already migrated (or a fresh DB) — nothing to do

        foreach (var u in accountlessUsers)
        {
            db.Accounts.Add(new Account
            {
                UserId = u.Id,
                Name = "Efectivo",
                Type = AccountType.Cash,
                Balance = u.InitialBalance,
                UpdatedAt = DateTime.UtcNow
            });
        }
        await db.SaveChangesAsync(); // materialise the new account ids for the FK assignment below

        // Each user's earliest cash account is the one their legacy movements belong to.
        var firstCash = await db.Accounts
            .Where(a => a.Type == AccountType.Cash)
            .GroupBy(a => a.UserId)
            .Select(g => new { UserId = g.Key, AccountId = g.Min(a => a.Id) })
            .ToDictionaryAsync(x => x.UserId, x => x.AccountId);

        var orphanExpenses = await db.Expenses.Where(e => e.AccountId == null).ToListAsync();
        foreach (var e in orphanExpenses)
            if (firstCash.TryGetValue(e.UserId, out var accountId)) e.AccountId = accountId;

        var orphanIncomes = await db.Incomes.Where(i => i.AccountId == null).ToListAsync();
        foreach (var i in orphanIncomes)
            if (firstCash.TryGetValue(i.UserId, out var accountId)) i.AccountId = accountId;

        if (orphanExpenses.Count > 0 || orphanIncomes.Count > 0)
            await db.SaveChangesAsync();
    }
}
