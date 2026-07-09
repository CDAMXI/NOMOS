namespace Nomos.Application.DTOs;

public record CategoryDto(int Id, string Name, string Icon, string Color);

public record CreateCategoryRequest(string Name, string? Color);

public record UpdateCategoryRequest(string Name, string? Color);

public record ExpenseDto(int Id, string Description, decimal Amount, DateOnly Date, CategoryDto Category);

public record IncomeDto(int Id, string Description, decimal Amount, DateOnly Date);

/// <summary>Unified movement (expense or income) for lists. Category is null for incomes.</summary>
public record TransactionDto(int Id, string Kind, string Description, decimal Amount, DateOnly Date, CategoryDto? Category);

public record CreateExpenseRequest(decimal Amount, int CategoryId, string? Description, DateOnly? Date);

public record UpdateExpenseRequest(decimal Amount, int CategoryId, string? Description, DateOnly Date);

public record CreateIncomeRequest(decimal Amount, string? Description, DateOnly? Date);

public record UpdateIncomeRequest(decimal Amount, string? Description, DateOnly Date);

public record SeriesPointDto(DateOnly Date, decimal Value);

public record CategoryTotalDto(CategoryDto Category, decimal Total);

public record ExpensesDashboardDto(
    decimal Balance,
    string MonthLabel,
    string PrevMonthLabel,
    decimal MonthTotal,
    decimal PrevMonthTotal,
    double? DeltaPct,
    decimal MonthIncome,
    List<SeriesPointDto> Series,
    List<CategoryTotalDto> ByCategory,
    List<TransactionDto> Recent);

public record SetBalanceRequest(decimal Amount);

public record AccountDto(int Id, string Name, string Type, decimal Balance, DateTime UpdatedAt);

public record CreateAccountRequest(string Name, string Type, decimal Balance);

public record UpdateAccountRequest(string? Name, decimal Balance);

public record NetWorthDto(
    decimal Net,
    decimal Assets,
    decimal Liabilities,
    double? YearDeltaPct,
    List<SeriesPointDto> Series,
    List<AccountDto> Accounts);

public record UserDto(int Id, string Username, string? PhotoDataUrl);

public record RegisterRequest(string Username, string Password, string? PhotoDataUrl);

public record LoginRequest(string Username, string Password);

public record UpdateProfileRequest(string? Username, string? PhotoDataUrl);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
