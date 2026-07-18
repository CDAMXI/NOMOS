using System.Text;
using Nomos.Application.Common;
using Nomos.Application.DTOs;
using Xunit;

namespace Nomos.Tests;

public class CsvExportTests
{
    [Fact]
    public void Header_Signs_And_Escaping()
    {
        var txs = new List<TransactionDto>
        {
            new(1, "expense", "Café; con nota", 12.5m, new DateOnly(2026, 7, 18),
                new CategoryDto(1, "Comida", "🍽️", "#ffffff"), 2, "BBVA"),
            new(2, "income", "Nómina", 1000m, new DateOnly(2026, 7, 1), null, 2, "BBVA"),
        };

        var text = Encoding.UTF8.GetString(CsvExport.Transactions(txs));

        Assert.Contains("Fecha;Tipo;Descripción;Categoría;Importe;Cuenta", text);
        Assert.Contains("\"Café; con nota\"", text); // entrecomillado por contener ';'
        Assert.Contains("-12,50", text);              // gasto en negativo, decimal con coma
        Assert.Contains("1000,00", text);             // ingreso en positivo
    }
}
