namespace Nomos.Application.Common;

/// <summary>The starter categories every new user (and the demo seed) gets.</summary>
public static class DefaultCategories
{
    public static readonly (string Name, string Icon, string Color)[] All =
    [
        ("Comida", "🍱", "#f5a623"),
        ("Transporte", "🚌", "#1e7ce8"),
        ("Ocio", "🎮", "#8e5be8"),
        ("Vivienda", "🏡", "#34c759"),
        ("Salud", "❤️", "#ff3b30"),
        ("Otros", "📦", "#8e8e93"),
    ];

    /// <summary>Palette new user-created categories cycle through when a colour isn't supplied.</summary>
    public static readonly string[] Palette =
    [
        "#1e7ce8", "#34c759", "#f5a623", "#8e5be8", "#ff3b30",
        "#00b8a3", "#ff8a3d", "#e254a0", "#5a6b7b", "#c0392b",
    ];

    public static string PickColor(int existingCount) => Palette[existingCount % Palette.Length];
}
