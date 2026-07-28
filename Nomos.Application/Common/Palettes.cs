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
    /// usuarios la llevan; el registro la fija en el alta y el backfill migró a los existentes.
    /// </summary>
    public const string DefaultName = "marino";

    /// <summary>Espejo de PALETTES en categories.js (el front solo necesita Income).</summary>
    public static readonly IReadOnlyDictionary<string, Palette> All =
        new Dictionary<string, Palette>(StringComparer.OrdinalIgnoreCase)
        {
            // «marino»: la familia de la piel «Cuño» — navys e índigos del acento #1b3a8e y
            // slates del gris de marca, de oscuro a claro. Compatible por construcción con el
            // resto de la app; verde y rojo siguen siendo colores de DATO, fuera de la paleta.
            [DefaultName] = new(
                [
                    "#16265c", // navy noche
                    "#1e3d8f", // marca
                    "#2f55b0", // azur
                    "#4470c4", // medio
                    "#5d8bd9", // claro
                    "#7ea6e8", // cielo
                    "#a3bde8", // pálido
                    "#93a2c4", // slate claro
                    "#5f6d94", // slate
                    "#39415f", // slate oscuro
                ],
                new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
                {
                    ["error"] = "#16265c", // el más oscuro y grave de la paleta
                    ["salud"] = "#7ea6e8", // el registro suave y claro
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
    /// agotados, puntos medios entre pares consecutivos (nivel 1), luego cuartos (nivel 2)…
    /// </summary>
    public static string NextColor(Palette palette, IEnumerable<string?> usedHex)
    {
        var used = usedHex.Where(c => !string.IsNullOrEmpty(c))
            .Select(c => c!.ToLowerInvariant()).ToHashSet();
        foreach (var c in palette.Colors)
            if (!used.Contains(c)) return c;

        for (var level = 1; level <= 4; level++)
        {
            var t = 1.0 / (1 << level); // 1/2, 1/4, 1/8, 1/16
            for (var i = 0; i < palette.Colors.Length - 1; i++)
            {
                var mix = Mix(palette.Colors[i], palette.Colors[i + 1], t);
                if (!used.Contains(mix)) return mix;
            }
        }
        return palette.Colors[0]; // inalcanzable con el tope de categorías; por si acaso
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
