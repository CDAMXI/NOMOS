namespace Nomos.Domain.Entities;

public enum AccountType
{
    Cash,
    Investment,
    Other,
    Liability
}

public class Account
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public AccountType Type { get; set; }
    public decimal Balance { get; set; }
    public DateTime UpdatedAt { get; set; }
}
