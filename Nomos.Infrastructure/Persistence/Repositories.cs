using Microsoft.EntityFrameworkCore;
using Nomos.Application.Interfaces;
using Nomos.Domain.Entities;

namespace Nomos.Infrastructure.Persistence;

public class UserRepository(NomosDbContext db) : IUserRepository
{
    public Task<User?> GetByIdAsync(int id) =>
        db.Users.FirstOrDefaultAsync(u => u.Id == id);

    // Case-insensitive lookups keep usernames unique regardless of casing across providers.
    public Task<User?> GetByUsernameAsync(string username) =>
        db.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());

    public Task<bool> UsernameTakenAsync(string username, int? excludeUserId = null) =>
        db.Users.AnyAsync(u => u.Username.ToLower() == username.ToLower()
            && (excludeUserId == null || u.Id != excludeUserId));

    public async Task<User> AddAsync(User user)
    {
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return user;
    }

    public async Task UpdateAsync(User user)
    {
        db.Users.Update(user);
        await db.SaveChangesAsync();
    }
}

public class CategoryRepository(NomosDbContext db) : ICategoryRepository
{
    public Task<List<Category>> GetAllAsync(int userId) =>
        db.Categories.AsNoTracking().Where(c => c.UserId == userId).OrderBy(c => c.Id).ToListAsync();

    public Task<Category?> GetByIdAsync(int id, int userId) =>
        db.Categories.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

    public Task<bool> NameTakenAsync(int userId, string name, int? excludeId = null) =>
        db.Categories.AnyAsync(c => c.UserId == userId
            && c.Name.ToLower() == name.ToLower()
            && (excludeId == null || c.Id != excludeId));

    public async Task<Category> AddAsync(Category category)
    {
        db.Categories.Add(category);
        await db.SaveChangesAsync();
        return category;
    }

    public async Task AddRangeAsync(IEnumerable<Category> categories)
    {
        db.Categories.AddRange(categories);
        await db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Category category)
    {
        db.Categories.Update(category);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Category category)
    {
        db.Categories.Remove(category);
        await db.SaveChangesAsync();
    }
}

public class ExpenseRepository(NomosDbContext db) : IExpenseRepository
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

    public async Task<decimal> SumAllAsync(int userId) =>
        await db.Expenses.Where(e => e.UserId == userId).SumAsync(e => (decimal?)e.Amount) ?? 0m;

    public Task<bool> AnyForCategoryAsync(int categoryId, int userId) =>
        db.Expenses.AnyAsync(e => e.CategoryId == categoryId && e.UserId == userId);

    public async Task<Expense> AddAsync(Expense expense)
    {
        db.Expenses.Add(expense);
        await db.SaveChangesAsync();
        return expense;
    }

    public async Task UpdateAsync(Expense expense)
    {
        db.Expenses.Update(expense);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Expense expense)
    {
        db.Expenses.Remove(expense);
        await db.SaveChangesAsync();
    }
}

public class IncomeRepository(NomosDbContext db) : IIncomeRepository
{
    public Task<List<Income>> GetAllAsync(int userId) =>
        db.Incomes.AsNoTracking().Where(i => i.UserId == userId).ToListAsync();

    public Task<List<Income>> GetBetweenAsync(int userId, DateOnly from, DateOnly to) =>
        db.Incomes.AsNoTracking()
            .Where(i => i.UserId == userId && i.Date >= from && i.Date <= to)
            .ToListAsync();

    public Task<Income?> GetByIdAsync(int id, int userId) =>
        db.Incomes.FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

    public async Task<decimal> SumAllAsync(int userId) =>
        await db.Incomes.Where(i => i.UserId == userId).SumAsync(i => (decimal?)i.Amount) ?? 0m;

    public async Task<Income> AddAsync(Income income)
    {
        db.Incomes.Add(income);
        await db.SaveChangesAsync();
        return income;
    }

    public async Task UpdateAsync(Income income)
    {
        db.Incomes.Update(income);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Income income)
    {
        db.Incomes.Remove(income);
        await db.SaveChangesAsync();
    }
}

public class AccountRepository(NomosDbContext db) : IAccountRepository
{
    public Task<List<Account>> GetAllAsync(int userId) =>
        db.Accounts.AsNoTracking().Where(a => a.UserId == userId).ToListAsync();

    public Task<Account?> GetByIdAsync(int id, int userId) =>
        db.Accounts.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

    public async Task<Account> AddAsync(Account account)
    {
        db.Accounts.Add(account);
        await db.SaveChangesAsync();
        return account;
    }

    public async Task UpdateAsync(Account account)
    {
        db.Accounts.Update(account);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Account account)
    {
        db.Accounts.Remove(account);
        await db.SaveChangesAsync();
    }
}

public class HoldingRepository(NomosDbContext db) : IHoldingRepository
{
    public Task<List<Holding>> GetAllAsync(int userId) =>
        db.Holdings.AsNoTracking().Where(h => h.UserId == userId).ToListAsync();

    public Task<List<Holding>> GetByAccountAsync(int accountId, int userId) =>
        db.Holdings.AsNoTracking().Where(h => h.AccountId == accountId && h.UserId == userId).ToListAsync();

    public Task<Holding?> GetByIdAsync(int id, int userId) =>
        db.Holdings.FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);

    public async Task<Holding> AddAsync(Holding holding)
    {
        db.Holdings.Add(holding);
        await db.SaveChangesAsync();
        return holding;
    }

    public async Task UpdateAsync(Holding holding)
    {
        db.Holdings.Update(holding);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Holding holding)
    {
        db.Holdings.Remove(holding);
        await db.SaveChangesAsync();
    }
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

public class TripRepository(NomosDbContext db) : ITripRepository
{
    // Rastreado (sin AsNoTracking) para que el resumen incluya monedas y gastos.
    public Task<List<Trip>> GetAllAsync(int userId) =>
        db.Trips.AsNoTracking()
            .Include(t => t.Currencies)
            .Include(t => t.Expenses)
            .Where(t => t.UserId == userId)
            .ToListAsync();

    // Rastreado a propósito: UpdateAsync persiste los cambios en la colección de monedas.
    public Task<Trip?> GetDetailAsync(int id, int userId) =>
        db.Trips
            .Include(t => t.Currencies)
            .Include(t => t.Expenses).ThenInclude(e => e.Category)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

    public async Task<Trip> AddAsync(Trip trip)
    {
        db.Trips.Add(trip);
        await db.SaveChangesAsync();
        return trip;
    }

    public async Task UpdateAsync(Trip trip)
    {
        // trip viene rastreado de GetDetailAsync: guarda alta/baja/edición de monedas.
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Trip trip)
    {
        db.Trips.Remove(trip);
        await db.SaveChangesAsync();
    }

    public Task<bool> AnyExpenseForCategoryAsync(int categoryId, int userId) =>
        db.TripExpenses.AnyAsync(e => e.CategoryId == categoryId && e.UserId == userId);

    public Task<TripExpense?> GetExpenseAsync(int tripId, int expenseId, int userId) =>
        db.TripExpenses.Include(e => e.Category)
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.TripId == tripId && e.UserId == userId);

    public async Task<TripExpense> AddExpenseAsync(TripExpense expense)
    {
        db.TripExpenses.Add(expense);
        await db.SaveChangesAsync();
        return expense;
    }

    public async Task UpdateExpenseAsync(TripExpense expense)
    {
        await db.SaveChangesAsync();
    }

    public async Task DeleteExpenseAsync(TripExpense expense)
    {
        db.TripExpenses.Remove(expense);
        await db.SaveChangesAsync();
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
