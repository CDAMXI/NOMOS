using Nomos.Application.DTOs;
using Nomos.Application.Interfaces;
using Nomos.Domain.Entities;

namespace Nomos.Application.Services;

public class IncomeService(IIncomeRepository incomes, IAccountRepository accounts)
{
    public async Task<IncomeDto> CreateAsync(int userId, CreateIncomeRequest request, DateOnly today)
    {
        ValidateAmount(request.Amount);
        var account = await ResolveAccountAsync(userId, request.AccountId);

        var income = await incomes.AddAsync(new Income
        {
            UserId = userId,
            Amount = decimal.Round(request.Amount, 2),
            Description = ExpenseService.CleanDescription(request.Description, "Ingreso"),
            Date = ExpenseService.ValidateDate(request.Date ?? today),
            AccountId = account?.Id
        });
        return ToDto(income, account?.Name);
    }

    public async Task<IncomeDto?> UpdateAsync(int id, int userId, UpdateIncomeRequest request)
    {
        var income = await incomes.GetByIdAsync(id, userId);
        if (income is null) return null;
        ValidateAmount(request.Amount);
        var account = await ResolveAccountAsync(userId, request.AccountId);

        income.Amount = decimal.Round(request.Amount, 2);
        income.Description = ExpenseService.CleanDescription(request.Description, income.Description);
        income.Date = ExpenseService.ValidateDate(request.Date);
        income.AccountId = account?.Id;
        await incomes.UpdateAsync(income);
        return ToDto(income, account?.Name);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var income = await incomes.GetByIdAsync(id, userId);
        if (income is null) return false;
        await incomes.DeleteAsync(income);
        return true;
    }

    private static void ValidateAmount(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("El importe debe ser mayor que cero.");
        if (amount > 100_000_000m)
            throw new ArgumentException("El importe es demasiado grande.");
    }

    private async Task<Account?> ResolveAccountAsync(int userId, int? accountId)
    {
        if (accountId is not int id) return null;
        var account = await accounts.GetByIdAsync(id, userId)
            ?? throw new ArgumentException("Cuenta no encontrada.");
        if (account.Type != AccountType.Cash)
            throw new ArgumentException("Solo puedes asignar movimientos a cuentas de efectivo o banco.");
        return account;
    }

    internal static IncomeDto ToDto(Income i, string? accountName) =>
        new(i.Id, i.Description, i.Amount, i.Date, i.AccountId, accountName);
}
