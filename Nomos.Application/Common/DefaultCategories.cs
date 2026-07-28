namespace Nomos.Application.Common;

/// <summary>
/// The starter categories every new user (and the demo seed) gets. Los colores son exactamente
/// los que la paleta por defecto («índigo») asignaría (huecos semánticos primero — «Salud» — y
/// el resto en orden de base), de modo que alta y backfill producen el mismo resultado.
/// </summary>
public static class DefaultCategories
{
    public static readonly (string Name, string Icon, string Color)[] All =
    [
        ("Comida", "🍱", "#1b2447"),
        ("Transporte", "🚌", "#27367d"),
        ("Ocio", "🎮", "#3a4cae"),
        ("Vivienda", "🏡", "#5468cf"),
        ("Salud", "❤️", "#93a5ec"),
        ("Otros", "📦", "#7286e0"),
    ];
}
