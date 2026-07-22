using Microsoft.EntityFrameworkCore;
using Nomos.Application.Interfaces;
using Nomos.Domain.Entities;

namespace Nomos.Infrastructure.Persistence;

public class UserRepository(NomosDbContext context) : RepositoryBase<User>(context), IUserRepository
{
    public Task<User?> GetByIdAsync(int id) =>
        db.Users.FirstOrDefaultAsync(u => u.Id == id);

    // Case-insensitive lookups keep usernames unique regardless of casing across providers.
    public Task<User?> GetByUsernameAsync(string username) =>
        db.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());

    public Task<bool> UsernameTakenAsync(string username, int? excludeUserId = null) =>
        db.Users.AnyAsync(u => u.Username.ToLower() == username.ToLower()
            && (excludeUserId == null || u.Id != excludeUserId));

    public async Task DeleteWithDataAsync(int userId)
    {
        // Orden explícito con ExecuteDelete (sin change tracker): la cascada de BD tiene un
        // "diamante" (User→Categories en cascada vs Expense.CategoryId en Restrict, y
        // Holding.UserId en NoAction) cuyo orden no está garantizado entre proveedores.
        await using var tx = await db.Database.BeginTransactionAsync();
        await db.Holdings.Where(h => h.UserId == userId).ExecuteDeleteAsync();
        await db.Expenses.Where(e => e.UserId == userId).ExecuteDeleteAsync();
        await db.Incomes.Where(i => i.UserId == userId).ExecuteDeleteAsync();
        await db.Categories.Where(c => c.UserId == userId).ExecuteDeleteAsync();
        await db.Accounts.Where(a => a.UserId == userId).ExecuteDeleteAsync();
        await db.Snapshots.Where(s => s.UserId == userId).ExecuteDeleteAsync();
        await db.Users.Where(u => u.Id == userId).ExecuteDeleteAsync();
        await tx.CommitAsync();
    }
}

public class CategoryRepository(NomosDbContext context) : RepositoryBase<Category>(context), ICategoryRepository
{
    public Task<List<Category>> GetAllAsync(int userId) =>
        db.Categories.AsNoTracking().Where(c => c.UserId == userId).OrderBy(c => c.Id).ToListAsync();

    public Task<Category?> GetByIdAsync(int id, int userId) =>
        db.Categories.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

    public Task<bool> NameTakenAsync(int userId, string name, int? excludeId = null) =>
        db.Categories.AnyAsync(c => c.UserId == userId
            && c.Name.ToLower() == name.ToLower()
            && (excludeId == null || c.Id != excludeId));

    public async Task AddRangeAsync(IEnumerable<Category> categories)
    {
        db.Categories.AddRange(categories);
        await db.SaveChangesAsync();
    }

}

public class ExpenseRepository(NomosDbContext context) : RepositoryBase<Expense>(context), IExpenseRepository
{
    public Task<List<Expense>> GetAllAsync(int userId) =>
        db.Expenses.AsNoTracking()
            .Include(e => e.Category)
            .Where(e => e.UserId == userId)
            .ToListAsync();

    public Task<List<Expense>> GetBetweenAsync(int userId, DateOnly from, DateOnly to) =>
        db.Expenses.AsNoTracking()
            .Include(e => e.Category)
            .Where(e => e.UserId == userId && e.Date >= from && e.Date <= to)
            .ToListAsync();

    public Task<Expense?> GetByIdAsync(int id, int userId) =>
        db.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

    public Task<bool> AnyForCategoryAsync(int categoryId, int userId) =>
        db.Expenses.AnyAsync(e => e.CategoryId == categoryId && e.UserId == userId);

}

public class IncomeRepository(NomosDbContext context) : RepositoryBase<Income>(context), IIncomeRepository
{
    public Task<List<Income>> GetAllAsync(int userId) =>
        db.Incomes.AsNoTracking().Where(i => i.UserId == userId).ToListAsync();

    public Task<List<Income>> GetBetweenAsync(int userId, DateOnly from, DateOnly to) =>
        db.Incomes.AsNoTracking()
            .Where(i => i.UserId == userId && i.Date >= from && i.Date <= to)
            .ToListAsync();

    public Task<Income?> GetByIdAsync(int id, int userId) =>
        db.Incomes.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

}

public class AccountRepository(NomosDbContext context) : RepositoryBase<Account>(context), IAccountRepository
{
    public Task<List<Account>> GetAllAsync(int userId) =>
        db.Accounts.AsNoTracking().Where(a => a.UserId == userId).ToListAsync();

    public Task<Account?> GetByIdAsync(int id, int userId) =>
        db.Accounts.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

}

public class HoldingRepository(NomosDbContext context) : RepositoryBase<Holding>(context), IHoldingRepository
{
    public Task<List<Holding>> GetAllAsync(int userId) =>
        db.Holdings.AsNoTracking().Where(h => h.UserId == userId).ToListAsync();

    public Task<List<Holding>> GetByAccountAsync(int accountId, int userId) =>
        db.Holdings.AsNoTracking().Where(h => h.AccountId == accountId && h.UserId == userId).ToListAsync();

    public Task<Holding?> GetByIdAsync(int id, int userId) =>
        db.Holdings.FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);

}

public class UnitOfWork(NomosDbContext db) : IUnitOfWork
{
    public async Task InTransactionAsync(Func<Task> action)
    {
        // Los proveedores relacionales (Npgsql y SQLite) soportan transacciones explícitas.
        // Si la acción lanza, el dispose hace rollback; solo se confirma al llegar a Commit.
        await using var tx = await db.Database.BeginTransactionAsync();
        await action();
        await tx.CommitAsync();
    }
}

public class SnapshotRepository(NomosDbContext db) : ISnapshotRepository
{
    public Task<List<NetWorthSnapshot>> GetFromAsync(int userId, DateOnly from) =>
        db.Snapshots.AsNoTracking()
            .Where(s => s.UserId == userId && s.Date >= from)
            .ToListAsync();

    public Task<NetWorthSnapshot?> GetByMonthAsync(int userId, int year, int month)
    {
        var start = new DateOnly(year, month, 1);
        var end = start.AddMonths(1);
        return db.Snapshots.FirstOrDefaultAsync(s => s.UserId == userId && s.Date >= start && s.Date < end);
    }

    public async Task UpsertAsync(NetWorthSnapshot snapshot)
    {
        var existing = await GetByMonthAsync(snapshot.UserId, snapshot.Date.Year, snapshot.Date.Month);
        if (existing is null)
        {
            db.Snapshots.Add(snapshot);
        }
        else
        {
            existing.Date = snapshot.Date;
            existing.Assets = snapshot.Assets;
            existing.Liabilities = snapshot.Liabilities;
        }
        await db.SaveChangesAsync();
    }
}
