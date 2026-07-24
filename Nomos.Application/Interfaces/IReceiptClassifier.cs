using Nomos.Application.DTOs;

namespace Nomos.Application.Interfaces;

/// <summary>
/// Clasificador de facturas (IA externa): extrae importe, fecha, comercio y categoría de la foto
/// de un ticket. La implementación vive en Infrastructure (adaptador HTTP); la lógica solo ve esto.
/// </summary>
public interface IReceiptClassifier
{
    /// <summary>
    /// categories = las del usuario (id + nombre) para que elija entre ellas; examples = su criterio real
    /// (concepto → categoría de gastos recientes) para imitarlo; today acota fechas alucinadas.
    /// </summary>
    Task<ScanReceiptResult> ClassifyAsync(string base64Image, string mimeType,
        IReadOnlyList<(int Id, string Name)> categories,
        IReadOnlyList<(string Description, string CategoryName)> examples, DateOnly today);
}
