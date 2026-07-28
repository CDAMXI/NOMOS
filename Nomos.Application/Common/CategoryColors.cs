namespace Nomos.Application.Common;

/// <summary>
/// Colores de categoría por INSERCIÓN: el tono nuevo se coloca en el punto medio del mayor
/// hueco angular entre los tonos ya usados, de modo que los colores existentes nunca cambian
/// (la asociación color→categoría que el usuario ya aprendió se conserva).
///
/// El rojo y el verde quedan VETADOS para categorías: en una app de finanzas ya son colores
/// de DATO (rojo = gasto/pasivo, verde = ingreso/activo) y una categoría verde parecería un
/// ingreso. Los colores casi grises son neutros: ni ocupan hueco ni se vetan.
/// </summary>
public static class CategoryColors
{
    /// <summary>
    /// Arcos de tono permitidos (grados). Su complemento veta el rojo [350°,20°) y el verde
    /// (70°,150°). El verde se veta ancho a propósito: los limas h70-110 siguen leyéndose
    /// «verde» al ojo humano (comprobado en producción); los amarillos h50-70 sí se permiten.
    /// </summary>
    private static readonly (double From, double To)[] AllowedArcs = [(20, 70), (150, 350)];

    private const double Saturation = 62;
    private const double Lightness = 55;
    private const double GreySaturation = 20; // S (%) por debajo del cual el color se trata como neutro

    /// <summary>Color para la categoría n+1: punto medio del mayor hueco angular libre.</summary>
    public static string Next(IEnumerable<string?> existingHex)
    {
        var used = existingHex
            .Select(TryParseHue)
            .Where(h => h.HasValue)
            .Select(h => h!.Value)
            .OrderBy(h => h)
            .ToList();

        double bestHue = 250, bestGap = -1; // círculo vacío → centro del arco largo
        foreach (var (from, to) in AllowedArcs)
        {
            // Los bordes del arco actúan como "paredes": el hueco no cruza las zonas vetadas.
            var points = new List<double> { from };
            points.AddRange(used.Where(h => h >= from && h <= to));
            points.Add(to);
            for (var i = 0; i < points.Count - 1; i++)
            {
                var gap = points[i + 1] - points[i];
                if (gap > bestGap)
                {
                    bestGap = gap;
                    bestHue = (points[i] + points[i + 1]) / 2;
                }
            }
        }
        return HslToHex(bestHue, Saturation, Lightness);
    }

    /// <summary>Color saturado cuyo tono cae en las zonas vetadas de rojo o verde.</summary>
    public static bool IsForbidden(string? hex)
    {
        var hue = TryParseHue(hex);
        return hue.HasValue && !AllowedArcs.Any(a => hue.Value >= a.From && hue.Value <= a.To);
    }

    /// <summary>Tono (0-360) de un hex #rgb/#rrggbb saturado; null si no parsea o es casi gris.</summary>
    private static double? TryParseHue(string? hex)
    {
        if (string.IsNullOrWhiteSpace(hex)) return null;
        var c = hex.Trim().TrimStart('#');
        if (c.Length == 3) c = $"{c[0]}{c[0]}{c[1]}{c[1]}{c[2]}{c[2]}";
        if (c.Length != 6 || !int.TryParse(c, System.Globalization.NumberStyles.HexNumber, null, out var n))
            return null;

        double r = ((n >> 16) & 255) / 255.0, g = ((n >> 8) & 255) / 255.0, b = (n & 255) / 255.0;
        double max = Math.Max(r, Math.Max(g, b)), min = Math.Min(r, Math.Min(g, b));
        var delta = max - min;
        var l = (max + min) / 2;
        var s = delta == 0 ? 0 : delta / (1 - Math.Abs(2 * l - 1));
        if (s * 100 < GreySaturation) return null; // neutro

        double h;
        if (max == r) h = 60 * (((g - b) / delta) % 6);
        else if (max == g) h = 60 * ((b - r) / delta + 2);
        else h = 60 * ((r - g) / delta + 4);
        return (h + 360) % 360;
    }

    internal static string HslToHex(double h, double s, double l)
    {
        s /= 100; l /= 100;
        var c = (1 - Math.Abs(2 * l - 1)) * s;
        var x = c * (1 - Math.Abs(h / 60 % 2 - 1));
        var m = l - c / 2;
        double r = 0, g = 0, b = 0;
        if (h < 60) { r = c; g = x; }
        else if (h < 120) { r = x; g = c; }
        else if (h < 180) { g = c; b = x; }
        else if (h < 240) { g = x; b = c; }
        else if (h < 300) { r = x; b = c; }
        else { r = c; b = x; }
        return $"#{(int)Math.Round((r + m) * 255):x2}{(int)Math.Round((g + m) * 255):x2}{(int)Math.Round((b + m) * 255):x2}";
    }
}
