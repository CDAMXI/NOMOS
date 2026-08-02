namespace Nomos.Application.Common;

/// <summary>
/// The starter categories every new user (and the demo seed) gets. Los colores son exactamente
/// los que la paleta por defecto («prisma») asignaría (huecos semánticos primero — «Salud» — y
/// el resto en orden de base), de modo que alta y backfill producen el mismo resultado.
/// </summary>
public static class DefaultCategories
{
    public static readonly (string Name, string Icon, string Color)[] All =
    [
        ("Comida", "🍱", "#557ad2"),
        ("Transporte", "🚌", "#3487a5"),
        ("Ocio", "🎮", "#9568ca"),
        ("Vivienda", "🏡", "#be51be"),
        ("Salud", "❤️", "#2e8a7e"),
        ("Otros", "📦", "#c9528e"),
    ];
}
