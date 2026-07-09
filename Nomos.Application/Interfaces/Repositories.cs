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

public interface ISnapshotRepository
{
    Task<List<NetWorthSnapshot>> GetFromAsync(int userId, DateOnly from);
    Task<NetWorthSnapshot?> GetByMonthAsync(int userId, int year, int month);
    Task UpsertAsync(NetWorthSnapshot snapshot);
}
