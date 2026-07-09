using System.Globalization;
using System.Text;

namespace Nomos.Application.Common;

/// <summary>
/// Picks an emoji for a category from its name (Spanish keywords). Kept in sync with the
/// client-side previewer in wwwroot/app.js so the icon shown while typing matches what is stored.
/// </summary>
public static class CategoryIcon
{
    public const string Fallback = "🏷️";

    // First matching rule wins, so put more specific keywords before generic ones.
    private static readonly (string Emoji, string[] Keywords)[] Rules =
    [
        ("🍽️", ["restaurante", "restaurant", "cena", "comer fuera", "bar", "tapas", "menu", "menú"]),
        ("🛒", ["mercadona", "carrefour", "lidl", "aldi", "dia", "super", "supermercado", "compra", "alimentacion", "alimentación", "grocery"]),
        ("☕", ["cafe", "café", "cafeteria", "cafetería", "starbucks"]),
        ("🍔", ["comida rapida", "comida rápida", "burger", "hamburguesa", "mcdonald", "kfc", "telepizza", "pizza", "kebab"]),
        ("🍱", ["comida", "food", "almuerzo", "desayuno"]),
        ("⛽", ["gasolina", "combustible", "diesel", "repsol", "cepsa", "gasolinera"]),
        ("🚇", ["metro", "cercanias", "cercanías"]),
        ("🚌", ["bus", "autobus", "autobús", "abono", "emt"]),
        ("🚆", ["tren", "renfe", "ave", "cercania"]),
        ("🚕", ["taxi", "uber", "cabify", "bolt"]),
        ("✈️", ["vuelo", "avion", "avión", "viaje", "vacaciones", "hotel", "airbnb", "booking"]),
        ("🚗", ["coche", "auto", "parking", "peaje", "itv", "taller", "transporte"]),
        ("🏠", ["alquiler", "hipoteca", "casa", "vivienda", "piso", "comunidad", "renta"]),
        ("💡", ["luz", "electricidad", "endesa", "iberdrola"]),
        ("💧", ["agua", "canal"]),
        ("🔥", ["gas", "calefaccion", "calefacción", "naturgy"]),
        ("📶", ["internet", "fibra", "wifi", "movil", "móvil", "telefono", "teléfono", "movistar", "vodafone", "orange", "yoigo"]),
        ("💊", ["farmacia", "medicina", "medicamento"]),
        ("🏥", ["medico", "médico", "hospital", "dentista", "clinica", "clínica", "seguro medico", "salud"]),
        ("🏋️", ["gimnasio", "gym", "fitness", "crossfit", "padel", "pádel", "deporte"]),
        ("🎬", ["cine", "netflix", "hbo", "disney", "peliculas", "películas", "teatro"]),
        ("🎵", ["spotify", "musica", "música", "concierto", "apple music"]),
        ("🎮", ["juego", "videojuego", "gaming", "steam", "playstation", "xbox", "nintendo", "ocio"]),
        ("🕺", ["baile", "bailar", "danza", "dance", "salsa", "bachata", "zumba", "discoteca"]),
        ("📚", ["libro", "libreria", "librería", "curso", "universidad", "upv", "matricula", "matrícula", "educacion", "educación", "estudios", "formacion", "formación"]),
        ("👕", ["ropa", "moda", "zara", "camiseta", "zapatos", "calzado", "vestir"]),
        ("💻", ["ordenador", "portatil", "portátil", "pc", "software", "tecnologia", "tecnología", "gadget"]),
        ("📱", ["telefono movil", "smartphone", "iphone", "android"]),
        ("🎁", ["regalo", "cumpleanos", "cumpleaños", "navidad"]),
        ("🐶", ["mascota", "perro", "gato", "veterinario", "pienso"]),
        ("💄", ["belleza", "peluqueria", "peluquería", "cosmetica", "cosmética", "maquillaje"]),
        ("🎓", ["beca", "tasas"]),
        ("💰", ["ahorro", "inversion", "inversión", "nomina", "nómina", "sueldo", "salario"]),
        ("🏦", ["banco", "comision", "comisión", "hucha"]),
        ("🎈", ["fiesta", "evento", "salir"]),
        ("🚬", ["tabaco", "estanco"]),
        ("🍺", ["cerveza", "alcohol", "copas", "bebida"]),
        ("🧾", ["impuesto", "hacienda", "irpf", "iva", "multa"]),
        ("❤️", ["salud"]),
        ("🛠️", ["reparacion", "reparación", "herramienta", "ferreteria", "ferretería", "hogar"]),
        ("✂️", ["barberia", "barbería", "corte"]),
        ("📦", ["otros", "otro", "other", "varios", "misc", "miscelanea", "miscelánea"]),
    ];

    public static string ForName(string? name)
    {
        var normalized = Normalize(name);
        if (normalized.Length == 0) return Fallback;

        foreach (var (emoji, keywords) in Rules)
            foreach (var keyword in keywords)
                if (normalized.Contains(keyword))
                    return emoji;

        return Fallback;
    }

    /// <summary>Lowercase and strip accents so "Alquiler"/"alquíler" both match the keyword lists.</summary>
    private static string Normalize(string? text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;
        var decomposed = text.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(decomposed.Length);
        foreach (var ch in decomposed)
            if (CharUnicodeInfo.GetUnicodeCategory(ch) != UnicodeCategory.NonSpacingMark)
                sb.Append(ch);
        return sb.ToString().Normalize(NormalizationForm.FormC);
    }
}
