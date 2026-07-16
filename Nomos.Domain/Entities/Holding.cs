namespace Nomos.Domain.Entities;

/// <summary>
/// Un lote de acciones dentro de una cuenta de inversión (broker). Cada compra crea un lote
/// independiente; vender reduce las acciones del lote elegido y lo elimina al llegar a cero.
/// </summary>
public class Holding
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int AccountId { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public decimal Shares { get; set; }
    public decimal BuyPrice { get; set; }
    public DateOnly BuyDate { get; set; }
}
