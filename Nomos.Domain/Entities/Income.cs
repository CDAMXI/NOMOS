namespace Nomos.Domain.Entities;

public class Income
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateOnly Date { get; set; }
    /// <summary>Bank account the money went into (null = unassigned).</summary>
    public int? AccountId { get; set; }
}
