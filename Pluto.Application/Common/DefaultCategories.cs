namespace Pluto.Application.Common;

/// <summary>
/// The starter categories every new user (and the demo seed) gets. Los colores son exactamente
/// los que la paleta por defecto («apple») asignaría (huecos semánticos primero — «Salud» — y
/// el resto en orden de base), de modo que alta y backfill producen el mismo resultado.
/// </summary>
public static class DefaultCategories
{
    public static readonly (string Name, string Icon, string Color)[] All =
    [
        ("Comida", "🍱", "#007aff"),
        ("Transporte", "🚌", "#5856d6"),
        ("Ocio", "🎮", "#af52de"),
        ("Vivienda", "🏡", "#e68600"),
        ("Salud", "❤️", "#ff2d55"),
        ("Otros", "📦", "#00aea6"),
    ];
}
