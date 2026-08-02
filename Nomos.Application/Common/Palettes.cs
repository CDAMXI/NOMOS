namespace Nomos.Application.Common;

/// <summary>
/// Paletas temáticas de colores de categoría. Un usuario con <see cref="Domain.Entities.User.Palette"/>
/// toma sus colores de aquí en vez de la rueda de tonos de <see cref="CategoryColors"/>.
///
/// Cada paleta define: la lista ordenada de colores base, los huecos SEMÁNTICOS (categorías con
/// significado — «error», «salud» — reciben un color afín DENTRO de la paleta, no uno arbitrario)
/// y el color del indicador de ingreso (el tinte del icono 💶; el «+importe» sigue siendo el verde
/// de dato, esa semántica no pertenece a la paleta).
///
/// Si hay más categorías que colores, el siguiente se CALCULA: puntos medios entre pares
/// consecutivos de la paleta (mismo carácter, determinista). Con el tope de 12 categorías por
/// usuario, una paleta de 10 nunca necesita más de un nivel de interpolación.
/// </summary>
public static class Palettes
{
    public sealed record Palette(
        string[] Colors,
        IReadOnlyDictionary<string, string> Semantic,
        string Income);

    /// <summary>
    /// Paleta única de la app, NO negociable (decisión de Charlie, 2026-07-28): todos los
    /// usuarios la llevan; el registro la fija en el alta y el backfill migra a los existentes
    /// cuando cambia (basta con apuntar aquí a otra entrada del registro).
    /// </summary>
    public const string DefaultName = "prisma";

    /// <summary>Espejo de PALETTES en categories.js (el front solo necesita Income).</summary>
    public static readonly IReadOnlyDictionary<string, Palette> All =
        new Dictionary<string, Palette>(StringComparer.OrdinalIgnoreCase)
        {
            // «prisma»: tonos VARIADOS que armonizan con el marino de la marca — todos a la
            // misma luminancia (contraste ≥4:1 sobre la tarjeta clara Y la oscura, calculado)
            // y con 22° mínimo de separación de tono, para que la rueda se lea de un vistazo.
            // Sin rojos ni verdes: siguen reservados como colores de DATO.
            [DefaultName] = new(
                [
                    "#557ad2", // índigo de marca
                    "#3487a5", // azul cielo
                    "#9568ca", // violeta
                    "#be51be", // púrpura
                    "#c9528e", // fucsia
                    "#b16d2a", // ámbar
                    "#8b7e25", // oro
                    "#2e8a7e", // teal
                    "#777c94", // slate frío
                    "#8f7968", // taupe cálido
                ],
                new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
                {
                    ["error"] = "#b16d2a", // ámbar: el registro de aviso, sin invadir el rojo de dato
                    ["salud"] = "#2e8a7e", // teal: el registro clínico
                },
                Income: "#34c759") // el verde de dato de la app ES su color de ingreso
        };

    public static Palette? Get(string? name) =>
        name is not null && All.TryGetValue(name, out var p) ? p : null;

    /// <summary>Color semántico si el nombre de la categoría lo tiene reservado en la paleta.</summary>
    public static string? SemanticColor(Palette palette, string categoryName) =>
        palette.Semantic.TryGetValue(Normalize(categoryName), out var color) ? color : null;

    /// <summary>
    /// Siguiente color de la paleta que el usuario no usa todavía: primero los base en orden y,
    /// agotados, puntos medios entre pares consecutivos. Con el tope de 12 categorías y 10 base
    /// (+9 puntos medios) siempre queda hueco libre.
    /// </summary>
    public static string NextColor(Palette palette, IEnumerable<string?> usedHex)
    {
        var used = usedHex.Where(c => !string.IsNullOrEmpty(c))
            .Select(c => c!.ToLowerInvariant()).ToHashSet();
        foreach (var c in palette.Colors)
            if (!used.Contains(c)) return c;
        for (var i = 0; i < palette.Colors.Length - 1; i++)
        {
            var mix = Mix(palette.Colors[i], palette.Colors[i + 1], 0.5);
            if (!used.Contains(mix)) return mix;
        }
        return palette.Colors[0];
    }

    private static string Normalize(string name) =>
        string.Concat(name.Trim().ToLowerInvariant().Normalize(System.Text.NormalizationForm.FormD)
            .Where(ch => System.Globalization.CharUnicodeInfo.GetUnicodeCategory(ch)
                != System.Globalization.UnicodeCategory.NonSpacingMark));

    /// <summary>Mezcla lineal en RGB: a + (b − a)·t.</summary>
    private static string Mix(string hexA, string hexB, double t)
    {
        var a = Convert.ToInt32(hexA.TrimStart('#'), 16);
        var b = Convert.ToInt32(hexB.TrimStart('#'), 16);
        int Ch(int shift)
        {
            var ca = (a >> shift) & 255;
            var cb = (b >> shift) & 255;
            return (int)Math.Round(ca + (cb - ca) * t);
        }
        return $"#{Ch(16):x2}{Ch(8):x2}{Ch(0):x2}";
    }
}
