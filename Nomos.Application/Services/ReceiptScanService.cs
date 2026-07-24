using Nomos.Application.Common;
using Nomos.Application.DTOs;
using Nomos.Application.Interfaces;
using Nomos.Domain.Entities;

namespace Nomos.Application.Services;

/// <summary>
/// Escaneo de facturas: valida la foto, llama al clasificador (IA) y sanea el resultado contra los
/// datos del usuario. La foto es EFÍMERA: se analiza y se descarta, nunca se persiste.
/// </summary>
public class ReceiptScanService(ICategoryRepository categories, IExpenseRepository expenses, IReceiptClassifier classifier)
{
    private const int MaxPhotoLength = 1_500_000; // ~1,1 MB decodificado; sobra para una foto comprimida
    internal const int MaxExamples = 30; // ejemplos de criterio que viajan en el prompt

    public async Task<ScanReceiptResult> ScanAsync(int userId, ScanReceiptRequest request, DateOnly today)
    {
        var dataUrl = ImageDataUrl.Validate(request.PhotoDataUrl, MaxPhotoLength,
                "La foto es demasiado grande.", "La foto debe ser una imagen válida.")
            ?? throw new ArgumentException("Falta la foto de la factura.");

        // data:image/jpeg;base64,XXXX → mime + payload (la forma ya está validada por ImageDataUrl).
        var mime = dataUrl["data:".Length..dataUrl.IndexOf(';')];
        var base64 = dataUrl[(dataUrl.IndexOf(',') + 1)..];

        var cats = (await categories.GetAllAsync(userId)).Select(c => (c.Id, c.Name)).ToList();
        var examples = BuildExamples(await expenses.GetAllAsync(userId));
        var raw = await classifier.ClassifyAsync(base64, mime, cats, examples, today);
        return Sanitize(raw, cats, today);
    }

    /// <summary>
    /// El criterio de clasificación del usuario, aprendido de sus propios gastos: los pares
    /// (descripción → categoría) más recientes, sin duplicados y sin los pares sin señal
    /// (la descripción vacía hereda el nombre de la categoría).
    /// </summary>
    internal static List<(string Description, string CategoryName)> BuildExamples(List<Expense> all)
    {
        var seen = new HashSet<string>();
        var result = new List<(string, string)>();
        foreach (var e in all.OrderByDescending(x => x.Date).ThenByDescending(x => x.Id))
        {
            if (e.Category is null) continue;
            var desc = e.Description.Trim();
            if (desc.Length == 0 || desc.Equals(e.Category.Name, StringComparison.OrdinalIgnoreCase)) continue;
            if (!seen.Add(desc.ToLowerInvariant())) continue;
            result.Add((desc, e.Category.Name));
            if (result.Count == MaxExamples) break;
        }
        return result;
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
