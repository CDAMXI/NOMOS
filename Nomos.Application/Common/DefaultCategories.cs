namespace Nomos.Application.Common;

/// <summary>
/// The starter categories every new user (and the demo seed) gets. Los colores viven fuera de
/// las zonas vetadas de <see cref="CategoryColors"/> (rojo/verde son colores de DATO en la app);
/// «Otros» es gris deliberadamente: neutro, ni ocupa hueco ni compite con las demás.
/// </summary>
public static class DefaultCategories
{
    public static readonly (string Name, string Icon, string Color)[] All =
    [
        ("Comida", "🍱", "#f5a623"),
        ("Transporte", "🚌", "#1e7ce8"),
        ("Ocio", "🎮", "#8e5be8"),
        ("Vivienda", "🏡", "#00b8a3"),
        ("Salud", "❤️", "#e254a0"),
        ("Otros", "📦", "#8e8e93"),
    ];
}
