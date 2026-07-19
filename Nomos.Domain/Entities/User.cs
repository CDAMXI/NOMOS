namespace Nomos.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    /// <summary>Format: {iterations}.{saltBase64}.{hashBase64} (PBKDF2-SHA256).</summary>
    public string PasswordHash { get; set; } = string.Empty;
    /// <summary>Small square avatar stored as a data: URL, or null for the default initial.</summary>
    public string? PhotoDataUrl { get; set; }
    /// <summary>Baseline used for the running balance: available = InitialBalance + incomes − expenses.</summary>
    public decimal InitialBalance { get; set; }
    /// <summary>Opt-in "Gastos de viaje": muestra la pestaña Viajes. Apagarlo la oculta sin borrar datos.</summary>
    public bool TripsEnabled { get; set; }
    /// <summary>Divisa principal (ISO 4217, p. ej. "EUR", "USD"). Solo display: no convierte importes.</summary>
    public string Currency { get; set; } = "EUR";
    public DateTime CreatedAt { get; set; }
}
