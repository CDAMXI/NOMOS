namespace Nomos.Domain.Entities;

/// <summary>Monthly snapshot of a user's total assets and liabilities, used for the annual evolution chart.</summary>
public class NetWorthSnapshot
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateOnly Date { get; set; }
    public decimal Assets { get; set; }
    public decimal Liabilities { get; set; }
    public decimal Net => Assets - Liabilities;
}
