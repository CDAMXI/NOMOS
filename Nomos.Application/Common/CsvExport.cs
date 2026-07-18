using System.Globalization;
using System.Text;
using Nomos.Application.DTOs;

namespace Nomos.Application.Common;

/// <summary>
/// Exporta los movimientos a CSV. Usa separador ';' y decimales con coma para que Excel en
/// español lo abra en columnas sin configurar nada, y BOM UTF-8 para respetar las tildes.
/// </summary>
public static class CsvExport
{
    private static readonly CultureInfo Es = CultureInfo.GetCultureInfo("es-ES");

    public static byte[] Transactions(IEnumerable<TransactionDto> txs)
    {
        var sb = new StringBuilder();
        sb.Append('﻿'); // BOM: Excel detecta UTF-8
        sb.Append("Fecha;Tipo;Descripción;Categoría;Importe;Cuenta\r\n");
        foreach (var t in txs)
        {
            var tipo = t.Kind == "income" ? "Ingreso" : "Gasto";
            var importe = (t.Kind == "income" ? t.Amount : -t.Amount).ToString("0.00", Es);
            sb.Append(Field(t.Date.ToString("yyyy-MM-dd"))).Append(';')
              .Append(Field(tipo)).Append(';')
              .Append(Field(t.Description)).Append(';')
              .Append(Field(t.Category?.Name ?? "")).Append(';')
              .Append(Field(importe)).Append(';')
              .Append(Field(t.AccountName ?? "")).Append("\r\n");
        }
        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    // Entrecomilla si el campo contiene el separador, comillas o saltos de línea (RFC 4180).
    private static string Field(string value) =>
        value.IndexOfAny([';', '"', '\n', '\r']) >= 0
            ? '"' + value.Replace("\"", "\"\"") + '"'
            : value;
}
