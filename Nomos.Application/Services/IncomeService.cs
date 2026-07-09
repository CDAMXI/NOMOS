using Nomos.Application.DTOs;
using Nomos.Application.Interfaces;
using Nomos.Domain.Entities;

namespace Nomos.Application.Services;

public class IncomeService(IIncomeRepository incomes)
{
    public async Task<IncomeDto> CreateAsync(int userId, CreateIncomeRequest request, DateOnly today)
    {
        if (request.Amount <= 0)
            throw new ArgumentException("El importe debe ser mayor que cero.");
        if (request.Amount > 100_000_000m)
            throw new ArgumentException("El importe es demasiado grande.");

        var income = await incomes.AddAsync(new Income
        {
            UserId = userId,
            Amount = decimal.Round(request.Amount, 2),
            Description = ExpenseService.CleanDescription(request.Description, "Ingreso"),
            Date = ExpenseService.ValidateDate(request.Date ?? today)
        });
        return ToDto(income);
    }

    public async Task<IncomeDto?> UpdateAsync(int id, int userId, UpdateIncomeRequest request)
    {
        var income = await incomes.GetByIdAsync(id, userId);
        if (income is null) return null;
        if (request.Amount <= 0)
            throw new ArgumentException("El importe debe ser mayor que cero.");
        if (request.Amount > 100_000_000m)
            throw new ArgumentException("El importe es demasiado grande.");

        income.Amount = decimal.Round(request.Amount, 2);
        income.Description = ExpenseService.CleanDescription(request.Description, income.Description);
        income.Date = ExpenseService.ValidateDate(request.Date);
        await incomes.UpdateAsync(income);
        return ToDto(income);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var income = await incomes.GetByIdAsync(id, userId);
        if (income is null) return false;
        await incomes.DeleteAsync(income);
        return true;
    }

    internal static IncomeDto ToDto(Income i) => new(i.Id, i.Description, i.Amount, i.Date);
}
