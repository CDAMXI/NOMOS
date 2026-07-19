using ClosedXML.Excel;
using Nomos.Application.DTOs;

namespace Nomos.Application.Common;

/// <summary>
/// Exporta los movimientos a un Excel (.xlsx): fechas como fecha real e importes como número
/// (para filtrar/ordenar en Excel), columnas auto-ajustadas al contenido, cabecera en negrita
/// y fija, y filtro. A diferencia del CSV, el .xlsx sí guarda anchos y formato de columna.
/// </summary>
public static class ExcelExport
{
    public static byte[] Transactions(IEnumerable<TransactionDto> txs)
    {
        using var wb = new XLWorkbook();
        var ws = wb.AddWorksheet("Movimientos");

        string[] headers = ["Fecha", "Tipo", "Descripción", "Categoría", "Importe", "Cuenta"];
        for (var c = 0; c < headers.Length; c++)
            ws.Cell(1, c + 1).Value = headers[c];
        ws.Row(1).Style.Font.Bold = true;

        var r = 2;
        foreach (var t in txs)
        {
            ws.Cell(r, 1).Value = t.Date.ToDateTime(TimeOnly.MinValue);
            ws.Cell(r, 1).Style.DateFormat.Format = "dd/mm/yyyy";
            ws.Cell(r, 2).Value = t.Kind == "income" ? "Ingreso" : "Gasto";
            ws.Cell(r, 3).Value = t.Description;
            ws.Cell(r, 4).Value = t.Category?.Name ?? "";
            ws.Cell(r, 5).Value = t.Kind == "income" ? t.Amount : -t.Amount;
            ws.Cell(r, 5).Style.NumberFormat.Format = "#,##0.00";
            ws.Cell(r, 6).Value = t.AccountName ?? "";
            r++;
        }

        ws.SheetView.FreezeRows(1);
        ws.Column(5).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
        if (r > 2) ws.Range(1, 1, r - 1, headers.Length).SetAutoFilter();
        ws.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }
}
