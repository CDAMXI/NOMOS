using ClosedXML.Excel;
using Nomos.Application.Common;
using Nomos.Application.DTOs;
using Xunit;

namespace Nomos.Tests;

public class ExcelExportTests
{
    [Fact]
    public void Headers_Dates_And_Signs()
    {
        var txs = new List<TransactionDto>
        {
            new(1, "expense", "Café con nota", 12.5m, new DateOnly(2026, 7, 18),
                new CategoryDto(1, "Comida", "🍽️", "#ffffff"), 2, "BBVA"),
            new(2, "income", "Nómina", 1000m, new DateOnly(2026, 7, 1), null, 2, "BBVA"),
        };

        using var wb = new XLWorkbook(new MemoryStream(ExcelExport.Transactions(txs)));
        var ws = wb.Worksheet(1);

        Assert.Equal("Fecha", ws.Cell(1, 1).GetString());
        Assert.Equal("Importe", ws.Cell(1, 5).GetString());
        Assert.Equal(new DateTime(2026, 7, 18), ws.Cell(2, 1).GetDateTime()); // fecha real, no texto
        Assert.Equal(-12.5, ws.Cell(2, 5).GetDouble());                        // gasto en negativo
        Assert.Equal(1000, ws.Cell(3, 5).GetDouble());                         // ingreso en positivo
        Assert.Equal("Ingreso", ws.Cell(3, 2).GetString());
    }
}
