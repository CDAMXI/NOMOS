using Nomos.Application.Common;
using Xunit;

namespace Nomos.Tests;

public class CategoryIconTests
{
    /// <summary>
    /// Una tabla de reglas por subcadena se audita por INALCANZABILIDAD: cada palabra clave tiene
    /// que devolverse a sí misma. Si una regla posterior contiene una subcadena de otra anterior
    /// («barberia» contiene «bar»), esa clave nunca se alcanza y muere en silencio.
    /// </summary>
    [Fact]
    public void CadaPalabraClaveDevuelveSuPropiaRegla()
    {
        var muertas = new List<string>();

        foreach (var regla in CategoryIcon.ForClient())
            foreach (var clave in regla.Keywords)
            {
                var obtenido = CategoryIcon.ForName(clave);
                if (obtenido != regla.Icon)
                    muertas.Add($"'{clave}' deberia dar {regla.Icon} y da {obtenido}");
            }

        Assert.True(muertas.Count == 0, "Claves inalcanzables:\n" + string.Join("\n", muertas));
    }

    /// <summary>El caso que lo destapó: la vista previa enseñaba corazón y se guardaba hospital.</summary>
    [Theory]
    [InlineData("Salud", "❤️")]
    [InlineData("salud", "❤️")]
    [InlineData("Médico", "🏥")]
    [InlineData("Hospital", "🏥")]
    [InlineData("Barberia", "✂️")]
    [InlineData("Bar", "🍽️")]
    public void NombreDaElIconoEsperado(string nombre, string esperado) =>
        Assert.Equal(esperado, CategoryIcon.ForName(nombre));

    /// <summary>La tabla que se sirve al cliente es la misma con la que se decide lo que se guarda.</summary>
    [Fact]
    public void LaTablaServidaCoincideConLaQueDecide()
    {
        foreach (var regla in CategoryIcon.ForClient())
        {
            Assert.NotEmpty(regla.Keywords);
            Assert.False(string.IsNullOrWhiteSpace(regla.Icon));
        }
        Assert.Equal("🏷️", CategoryIcon.ForName("zzz-sin-coincidencia"));
    }
}
