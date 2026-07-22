namespace Nomos.Application.DTOs;

public record CategoryDto(int Id, string Name, string Icon, string Color);

public record CreateCategoryRequest(string Name, string? Color);

public record UpdateCategoryRequest(string Name, string? Color);

public record ExpenseDto(int Id, string Description, decimal Amount, DateOnly Date, CategoryDto Category, int? AccountId, string? AccountName);

public record IncomeDto(int Id, string Description, decimal Amount, DateOnly Date, int? AccountId, string? AccountName);

/// <summary>Unified movement (expense or income) for lists. Category is null for incomes.</summary>
public record TransactionDto(int Id, string Kind, string Description, decimal Amount, DateOnly Date, CategoryDto? Category, int? AccountId, string? AccountName);

public record CreateExpenseRequest(decimal Amount, int CategoryId, string? Description, DateOnly? Date, int? AccountId);

public record UpdateExpenseRequest(decimal Amount, int CategoryId, string? Description, DateOnly Date, int? AccountId);

public record CreateIncomeRequest(decimal Amount, string? Description, DateOnly? Date, int? AccountId);

public record UpdateIncomeRequest(decimal Amount, string? Description, DateOnly Date, int? AccountId);

public record SeriesPointDto(DateOnly Date, decimal Value);

public record CategoryTotalDto(CategoryDto Category, decimal Total);

/// <summary>Category breakdown of the window's expenses assigned to one account.</summary>
public record AccountBreakdownDto(int AccountId, List<CategoryTotalDto> ByCategory);

public record ExpensesDashboardDto(
    decimal Balance,
    DateOnly MonthDate,
    string MonthLabel,
    string PrevMonthLabel,
    decimal MonthTotal,
    decimal PrevMonthTotal,
    double? DeltaPct,
    decimal MonthIncome,
    List<SeriesPointDto> Series,
    List<CategoryTotalDto> ByCategory,
    List<AccountBreakdownDto> ByAccount,
    List<TransactionDto> Recent);

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

// --- Inversiones (broker) ---
public record HoldingDto(int Id, string Symbol, decimal Shares, decimal BuyPrice, decimal Cost, DateOnly BuyDate);

/// <summary>Estado de una cuenta broker: total = margen libre + coste de las posiciones.</summary>
public record BrokerDto(int AccountId, string Name, decimal Margin, decimal Invested, decimal Total, List<HoldingDto> Holdings);

public record BuyRequest(string Symbol, decimal Shares, decimal Price);

public record SellRequest(int HoldingId, decimal Shares, decimal Price);

/// <summary>Mueve dinero entre una cuenta de efectivo y el margen libre del broker.</summary>
public record BrokerTransferRequest(int CashAccountId, decimal Amount, string Direction);

public record UserDto(int Id, string Username, string? PhotoDataUrl, string Currency);

public record RegisterRequest(string Username, string Password, string? PhotoDataUrl);

public record LoginRequest(string Username, string Password);

public record UpdateProfileRequest(string? Username, string? PhotoDataUrl, string? Currency);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

/// <summary>Borrado de la cuenta de usuario: exige la contraseña actual como confirmación.</summary>
public record DeleteAccountRequest(string Password);
