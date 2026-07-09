namespace Nomos.Domain.Entities;

public class Expense
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateOnly Date { get; set; }
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
}
