using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Nomos.Application.DTOs;
using Nomos.Application.Interfaces;

namespace Nomos.Infrastructure.Ai;

/// <summary>
/// Adaptador REST del clasificador de facturas sobre Gemini (generateContent con salida JSON
/// estructurada, temperatura baja). La clave vive en configuración (env Gemini__ApiKey); sin clave,
/// el escáner responde con un error claro en vez de romper el arranque.
/// </summary>
public class GeminiReceiptClassifier(HttpClient http, string? apiKey, string model,
    ILogger<GeminiReceiptClassifier> logger) : IReceiptClassifier
{
    public async Task<ScanReceiptResult> ClassifyAsync(string base64Image, string mimeType,
        IReadOnlyList<(int Id, string Name)> categories, DateOnly today)
    {
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new ArgumentException("El escáner de facturas no está configurado todavía.");

        var catList = string.Join("\n", categories.Select(c => $"{c.Id}: {c.Name}"));
        var prompt = $"""
            Eres el escáner de tickets de una app de finanzas personales. Analiza la imagen y extrae:
            - amount: importe TOTAL pagado (número con punto decimal, sin símbolo de moneda).
            - date: fecha del ticket en formato YYYY-MM-DD. Hoy es {today:yyyy-MM-dd}; nunca una fecha futura. null si no se ve.
            - description: nombre corto del comercio o concepto (máximo 60 caracteres).
            - categoryId: el id (entero) de la categoría del usuario que mejor encaje, elegido de esta lista; null si ninguna encaja con claridad:
            {catList}
            - confidence: tu confianza global entre 0 y 1.
            Si la imagen NO es un ticket, factura o recibo, devuelve todos los campos null y confidence 0.
            """;

        var body = new
        {
            contents = new[] { new { parts = new object[] {
                new { inline_data = new { mime_type = mimeType, data = base64Image } },
                new { text = prompt } } } },
            generationConfig = new
            {
                temperature = 0.1,
                response_mime_type = "application/json",
                response_schema = new
                {
                    type = "OBJECT",
                    properties = new
                    {
                        amount = new { type = "NUMBER", nullable = true },
                        date = new { type = "STRING", nullable = true },
                        description = new { type = "STRING", nullable = true },
                        categoryId = new { type = "INTEGER", nullable = true },
                        confidence = new { type = "NUMBER" }
                    },
                    required = new[] { "confidence" }
                }
            }
        };

        using var msg = new HttpRequestMessage(HttpMethod.Post,
            $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent");
        msg.Headers.Add("x-goog-api-key", apiKey);
        msg.Content = JsonContent.Create(body);

        using var res = await http.SendAsync(msg);
        var raw = await res.Content.ReadAsStringAsync();
        if (!res.IsSuccessStatusCode)
        {
            // El cuerpo del proveedor va SOLO al log (puede traer detalles internos); al usuario, el status.
            logger.LogWarning("Gemini {Status}: {Body}", (int)res.StatusCode, raw);
            throw new ArgumentException($"No se pudo leer la factura (proveedor: HTTP {(int)res.StatusCode}).");
        }
        try { return ParseResponse(raw); }
        catch (ArgumentException)
        {
            logger.LogWarning("Respuesta de Gemini no parseable: {Body}", raw);
            throw;
        }
    }

    /// <summary>Extrae el JSON del primer candidato y lo mapea al resultado. Estático para poder testearlo.</summary>
    internal static ScanReceiptResult ParseResponse(string json)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            var text = doc.RootElement.GetProperty("candidates")[0]
                .GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString()!;
            var p = JsonSerializer.Deserialize<GeminiPayload>(text, JsonOpts)!;
            DateOnly? date = DateOnly.TryParse(p.Date, out var d) ? d : null;
            return new ScanReceiptResult(p.Amount, date, p.Description, p.CategoryId, p.Confidence);
        }
        catch (Exception e) when (e is JsonException or KeyNotFoundException or InvalidOperationException or IndexOutOfRangeException or NullReferenceException)
        {
            throw new ArgumentException("No se pudo leer la factura. Inténtalo de nuevo.");
        }
    }

    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    private sealed record GeminiPayload(decimal? Amount, string? Date, string? Description, int? CategoryId, double Confidence);
}
