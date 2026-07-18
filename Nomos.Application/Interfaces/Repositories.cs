using Nomos.Domain.Entities;

namespace Nomos.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByUsernameAsync(string username);
    Task<bool> UsernameTakenAsync(string username, int? excludeUserId = null);
    Task<User> AddAsync(User user);
    Task UpdateAsync(User user);
}

public interface ICategoryRepository
{
    Task<List<Category>> GetAllAsync(int userId);
    Task<Category?> GetByIdAsync(int id, int userId);
    Task<bool> NameTakenAsync(int userId, string name, int? excludeId = null);
    Task<Category> AddAsync(Category category);
    Task AddRangeAsync(IEnumerable<Category> categories);
    Task UpdateAsync(Category category);
    Task DeleteAsync(Category category);
}

public interface IExpenseRepository
{
    Task<List<Expense>> GetAllAsync(int userId);
    Task<List<Expense>> GetBetweenAsync(int userId, DateOnly from, DateOnly to);
    Task<Expense?> GetByIdAsync(int id, int userId);
    Task<decimal> SumAllAsync(int userId);
    Task<bool> AnyForCategoryAsync(int categoryId, int userId);
    Task<Expense> AddAsync(Expense expense);
    Task UpdateAsync(Expense expense);
    Task DeleteAsync(Expense expense);
}

public interface IIncomeRepository
{
    Task<List<Income>> GetAllAsync(int userId);
    Task<List<Income>> GetBetweenAsync(int userId, DateOnly from, DateOnly to);
    Task<Income?> GetByIdAsync(int id, int userId);
    Task<decimal> SumAllAsync(int userId);
    Task<Income> AddAsync(Income income);
    Task UpdateAsync(Income income);
    Task DeleteAsync(Income income);
}

public interface IAccountRepository
{
    Task<List<Account>> GetAllAsync(int userId);
    Task<Account?> GetByIdAsync(int id, int userId);
    Task<Account> AddAsync(Account account);
    Task UpdateAsync(Account account);
    Task DeleteAsync(Account account);
}

public interface IHoldingRepository
{
    Task<List<Holding>> GetAllAsync(int userId);
    Task<List<Holding>> GetByAccountAsync(int accountId, int userId);
    Task<Holding?> GetByIdAsync(int id, int userId);
    Task<Holding> AddAsync(Holding holding);
    Task UpdateAsync(Holding holding);
    Task DeleteAsync(Holding holding);
}

/// <summary>
/// Ejecuta varias operaciones de repositorio dentro de una única transacción de base de datos:
/// o se confirman todas o no se confirma ninguna. Todos los repos comparten el mismo DbContext,
/// así que sus SaveChanges participan de la transacción abierta aquí.
/// </summary>
public interface IUnitOfWork
{
    Task InTransactionAsync(Func<Task> action);
}

public interface ITripRepository
{
    Task<List<Trip>> GetAllAsync(int userId);
    /// <summary>Un viaje con sus monedas y gastos (incluida la categoría de cada gasto) cargados.</summary>
    Task<Trip?> GetDetailAsync(int id, int userId);
    Task<Trip> AddAsync(Trip trip);
    Task UpdateAsync(Trip trip);
    Task DeleteAsync(Trip trip);

    Task<bool> AnyExpenseForCategoryAsync(int categoryId, int userId);
    Task<TripExpense?> GetExpenseAsync(int tripId, int expenseId, int userId);
    Task<TripExpense> AddExpenseAsync(TripExpense expense);
    Task UpdateExpenseAsync(TripExpense expense);
    Task DeleteExpenseAsync(TripExpense expense);
}

public interface ISnapshotRepository
{
    Task<List<NetWorthSnapshot>> GetFromAsync(int userId, DateOnly from);
    Task<NetWorthSnapshot?> GetByMonthAsync(int userId, int year, int month);
    Task UpsertAsync(NetWorthSnapshot snapshot);
}
