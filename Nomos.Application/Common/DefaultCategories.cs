namespace Nomos.Application.Common;

/// <summary>
/// The starter categories every new user (and the demo seed) gets. Los colores son exactamente
/// los que la paleta «marino» asignaría (huecos semánticos primero — «Salud» — y el resto en
/// orden de base), de modo que alta y backfill producen el mismo resultado.
/// </summary>
public static class DefaultCategories
{
    public static readonly (string Name, string Icon, string Color)[] All =
    [
        ("Comida", "🍱", "#16265c"),
        ("Transporte", "🚌", "#1e3d8f"),
        ("Ocio", "🎮", "#2f55b0"),
        ("Vivienda", "🏡", "#4470c4"),
        ("Salud", "❤️", "#7ea6e8"),
        ("Otros", "📦", "#5d8bd9"),
    ];
}
