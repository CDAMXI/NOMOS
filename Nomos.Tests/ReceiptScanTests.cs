using Nomos.Application.DTOs;
using Nomos.Application.Interfaces;
using Nomos.Application.Services;
using Nomos.Infrastructure.Ai;
using Xunit;

namespace Nomos.Tests;

public class ReceiptScanTests
{
    private static readonly List<(int Id, string Name)> Cats = [(1, "Comida"), (2, "Transporte")];
    private static readonly DateOnly Today = new(2026, 7, 22);

    [Fact]
    public void Sanitize_RejectsHallucinations_AndClampsValues()
    {
        // Categoría inexistente, fecha futura e importe negativo: todo debe neutralizarse.
        var raw = new ScanReceiptResult(-5m, Today.AddDays(3), "  Mercadona  ", 99, 1.7);
        var clean = ReceiptScanService.Sanitize(raw, Cats, Today);

        Assert.Null(clean.Amount);
        Assert.Null(clean.Date);
        Assert.Null(clean.CategoryId);
        Assert.Equal("Mercadona", clean.Description);
        Assert.Equal(1.0, clean.Confidence);
    }

    [Fact]
    public void Sanitize_KeepsValidSuggestions()
    {
        var raw = new ScanReceiptResult(12.345m, Today.AddDays(-1), "Bar Pepe", 2, 0.9);
        var clean = ReceiptScanService.Sanitize(raw, Cats, Today);

        Assert.Equal(12.34m, clean.Amount); // céntimos con redondeo bancario, igual que ExpenseService
        Assert.Equal(Today.AddDays(-1), clean.Date);
        Assert.Equal(2, clean.CategoryId);
        Assert.Equal(0.9, clean.Confidence);
    }

    [Fact]
    public void ParseResponse_MapsGeminiJson()
    {
        // Forma real de la respuesta de generateContent: el JSON útil va como TEXTO del primer part.
        const string gemini = """
            {"candidates":[{"content":{"parts":[{"text":
            "{\"amount\": 23.90, \"date\": \"2026-07-20\", \"description\": \"Mercadona\", \"categoryId\": 1, \"confidence\": 0.93}"
            }]}}]}
            """;
        var r = GeminiReceiptClassifier.ParseResponse(gemini);

        Assert.Equal(23.90m, r.Amount);
        Assert.Equal(new DateOnly(2026, 7, 20), r.Date);
        Assert.Equal("Mercadona", r.Description);
        Assert.Equal(1, r.CategoryId);
        Assert.Equal(0.93, r.Confidence);
    }

    [Fact]
    public void ParseResponse_MalformedJson_ThrowsClearError()
    {
        Assert.Throws<ArgumentException>(() => GeminiReceiptClassifier.ParseResponse("{\"candidates\":[]}"));
    }

    [Fact]
    public async Task ScanAsync_ValidatesPhoto_AndSanitizesAgainstUserCategories()
    {
        using var h = new TestHarness();
        var (userId, _, _) = await h.SeedAsync();
        var cat = new Nomos.Domain.Entities.Category { UserId = userId, Name = "Comida", Icon = "🍔", Color = "#123456" };
        h.Db.Categories.Add(cat);
        await h.Db.SaveChangesAsync();

        // El clasificador falso devuelve una categoría que NO es del usuario: debe salir null.
        var service = new ReceiptScanService(h.Categories, h.Expenses, new FakeClassifier(
            new ScanReceiptResult(10m, Today, "Bar", 999999, 0.8)));
        var tinyJpeg = "data:image/jpeg;base64," + Convert.ToBase64String(new byte[64]);

        var r = await service.ScanAsync(userId, new ScanReceiptRequest(tinyJpeg), Today);

        Assert.Equal(10m, r.Amount);
        Assert.Null(r.CategoryId);

        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.ScanAsync(userId, new ScanReceiptRequest("no-es-una-imagen"), Today));
    }

    [Fact]
    public void BuildExamples_DedupesSkipsNoSignal_AndOrdersRecentFirst()
    {
        var comida = new Nomos.Domain.Entities.Category { Id = 1, Name = "Comida" };
        var compra = new Nomos.Domain.Entities.Category { Id = 2, Name = "Compra" };
        var all = new List<Nomos.Domain.Entities.Expense>
        {
            new() { Id = 1, Description = "Mercadona", Category = compra, Date = Today.AddDays(-3) },
            new() { Id = 2, Description = "mercadona", Category = compra, Date = Today.AddDays(-2) }, // duplicado (mayúsculas)
            new() { Id = 3, Description = "Comida", Category = comida, Date = Today.AddDays(-1) },    // sin señal: desc = categoría
            new() { Id = 4, Description = "Kebab Estambul", Category = comida, Date = Today },
        };

        var ex = ReceiptScanService.BuildExamples(all);

        Assert.Equal(2, ex.Count);
        Assert.Equal(("Kebab Estambul", "Comida"), ex[0]); // más reciente primero
        Assert.Equal(("mercadona", "Compra"), ex[1]);      // se queda la aparición más reciente
    }

    private sealed class FakeClassifier(ScanReceiptResult result) : IReceiptClassifier
    {
        public Task<ScanReceiptResult> ClassifyAsync(string base64Image, string mimeType,
            IReadOnlyList<(int Id, string Name)> categories,
            IReadOnlyList<(string Description, string CategoryName)> examples, DateOnly today) => Task.FromResult(result);
    }
}
