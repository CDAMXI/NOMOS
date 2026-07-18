namespace Nomos.Domain.Entities;

/// <summary>
/// Un viaje: nombre, destino(s) y las monedas en juego. Es un registro aparte — sus gastos NO
/// afectan a las cuentas ni al patrimonio; solo alimentan el resumen del viaje.
/// </summary>
public class Trip
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Destinations { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<TripCurrency> Currencies { get; set; } = [];
    public List<TripExpense> Expenses { get; set; } = [];
}

/// <summary>Una moneda del viaje con su tasa manual a euros (1 unidad = RateToEur €).</summary>
public class TripCurrency
{
    public int Id { get; set; }
    public int TripId { get; set; }
    public string Code { get; set; } = string.Empty;
    public decimal RateToEur { get; set; }
}

/// <summary>Un gasto del viaje, en su moneda; con categoría y foto de factura opcionales.</summary>
public class TripExpense
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int TripId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public Category? Category { get; set; }
    public DateOnly Date { get; set; }
    /// <summary>Foto de la factura/recibo como data URL (null = sin factura).</summary>
    public string? ReceiptDataUrl { get; set; }
}
