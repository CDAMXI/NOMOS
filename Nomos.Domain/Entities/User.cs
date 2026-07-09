namespace Nomos.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    /// <summary>Format: {iterations}.{saltBase64}.{hashBase64} (PBKDF2-SHA256).</summary>
    public string PasswordHash { get; set; } = string.Empty;
    /// <summary>Small square avatar stored as a data: URL, or null for the default initial.</summary>
    public string? PhotoDataUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}
