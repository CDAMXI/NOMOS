using Nomos.Application.Common;
using Nomos.Application.DTOs;
using Nomos.Application.Interfaces;
using Nomos.Domain.Entities;

namespace Nomos.Application.Services;

public class IncomeService(IIncomeRepository incomes, IAccountRepository accounts)
{
    public async Task<IncomeDto> CreateAsync(int userId, CreateIncomeRequest request, DateOnly today)
    {
        ExpenseService.ValidateAmount(request.Amount);
        var account = await MovementAccounts.ResolveAsync(accounts, userId, request.AccountId);

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
        ExpenseService.ValidateAmount(request.Amount);
        var account = await MovementAccounts.ResolveAsync(accounts, userId, request.AccountId);

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

    internal static IncomeDto ToDto(Income i, string? accountName) =>
        new(i.Id, i.Description, i.Amount, i.Date, i.AccountId, accountName);
}
