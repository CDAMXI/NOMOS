using Nomos.Application.Common;
using Nomos.Application.DTOs;
using Nomos.Application.Interfaces;

namespace Nomos.Application.Services;

/// <summary>
/// Escaneo de facturas: valida la foto, llama al clasificador (IA) y sanea el resultado contra los
/// datos del usuario. La foto es EFÍMERA: se analiza y se descarta, nunca se persiste.
/// </summary>
public class ReceiptScanService(ICategoryRepository categories, IReceiptClassifier classifier)
{
    private const int MaxPhotoLength = 1_500_000; // ~1,1 MB decodificado; sobra para una foto comprimida

    public async Task<ScanReceiptResult> ScanAsync(int userId, ScanReceiptRequest request, DateOnly today)
    {
        var dataUrl = ImageDataUrl.Validate(request.PhotoDataUrl, MaxPhotoLength,
                "La foto es demasiado grande.", "La foto debe ser una imagen válida.")
            ?? throw new ArgumentException("Falta la foto de la factura.");

        // data:image/jpeg;base64,XXXX → mime + payload (la forma ya está validada por ImageDataUrl).
        var mime = dataUrl["data:".Length..dataUrl.IndexOf(';')];
        var base64 = dataUrl[(dataUrl.IndexOf(',') + 1)..];

        var cats = (await categories.GetAllAsync(userId)).Select(c => (c.Id, c.Name)).ToList();
        var raw = await classifier.ClassifyAsync(base64, mime, cats, today);
        return Sanitize(raw, cats, today);
    }

    /// <summary>El modelo puede alucinar: nada sale de aquí sin pasar por los límites de la app.</summary>
    internal static ScanReceiptResult Sanitize(ScanReceiptResult raw, List<(int Id, string Name)> cats, DateOnly today)
    {
        var amount = raw.Amount is > 0 and <= ExpenseService.MaxAmount
            ? decimal.Round(raw.Amount.Value, 2) : (decimal?)null;
        var date = raw.Date is { } d && d.Year >= 2000 && d <= today ? d : (DateOnly?)null;
        var trimmed = raw.Description?.Trim();
        var description = string.IsNullOrEmpty(trimmed) ? null
            : trimmed[..Math.Min(trimmed.Length, ExpenseService.MaxDescriptionLength)];
        var categoryId = raw.CategoryId is int id && cats.Any(c => c.Id == id) ? id : (int?)null;
        return new ScanReceiptResult(amount, date, description, categoryId, Math.Clamp(raw.Confidence, 0, 1));
    }
}
