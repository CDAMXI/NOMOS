using Nomos.Application.Common;
using Nomos.Application.Services;
using Nomos.Domain.Entities;
using Nomos.Infrastructure.Persistence;
using Xunit;

namespace Nomos.Tests;

public class CategoryColorTests
{
    [Fact]
    public void EmptyWheel_PlacesInMiddleOfLongestAllowedArc()
    {
        // Sin tonos ocupados, el mayor hueco es el arco (150,350) entero → punto medio 250.
        Assert.Equal(CategoryColors.HslToHex(250, 62, 55), CategoryColors.Next([]));
    }

    [Fact]
    public void PlacesNewHue_InMidpointOfLargestGap()
    {
        // Ocupados 39° (naranja) y 250°: el mayor hueco es (150,250) o (250,350), ambos de 100°.
        // El primero gana → punto medio 200°.
        var next = CategoryColors.Next(["#f5a623", CategoryColors.HslToHex(250, 62, 55)]);
        Assert.Equal(CategoryColors.HslToHex(200, 62, 55), next);
    }

    [Fact]
    public void TwelveSequentialColors_AllAllowedAndDistinct()
    {
        var colors = DefaultCategories.All.Select(d => d.Color).ToList();
        for (var i = colors.Count; i < 12; i++) colors.Add(CategoryColors.Next(colors));

        Assert.Equal(12, colors.Distinct(StringComparer.OrdinalIgnoreCase).Count());
        Assert.All(colors, c => Assert.False(CategoryColors.IsForbidden(c)));
    }

    [Fact]
    public void ForbiddenZones_CatchSemanticRedAndGreen_ButNotGreys()
    {
        Assert.True(CategoryColors.IsForbidden("#34c759"));  // verde de ingreso (legacy Vivienda)
        Assert.True(CategoryColors.IsForbidden("#ff3b30"));  // rojo de gasto (legacy Salud)
        Assert.False(CategoryColors.IsForbidden("#1e7ce8")); // azul
        Assert.False(CategoryColors.IsForbidden("#8e8e93")); // gris: neutro, nunca vetado
    }

    [Fact]
    public void GreyColors_DoNotOccupyAngularSpace()
    {
        Assert.Equal(CategoryColors.Next([]), CategoryColors.Next(["#8e8e93", "#5a6b7b"]));
    }

    [Fact]
    public async Task CreateAsync_RejectsThirteenthCategory()
    {
        using var h = new TestHarness();
        var (userId, _, _) = await h.SeedAsync();
        for (var i = 0; i < 12; i++)
            h.Db.Categories.Add(new Category { UserId = userId, Name = "C" + i, Icon = "🏷️", Color = "#1e7ce8" });
        await h.Db.SaveChangesAsync();

        var service = new CategoryService(h.Categories, h.Expenses);
        await Assert.ThrowsAsync<ConflictException>(() =>
            service.CreateAsync(userId, new Application.DTOs.CreateCategoryRequest("Trece", null)));
    }

    [Fact]
    public async Task Recolor_MovesOnlyForbiddenColors_AndKeepsTheRest()
    {
        using var h = new TestHarness();
        var (userId, _, _) = await h.SeedAsync();
        var keep = new Category { UserId = userId, Name = "Transporte", Icon = "🚌", Color = "#1e7ce8" };
        var green = new Category { UserId = userId, Name = "Vivienda", Icon = "🏡", Color = "#34c759" };
        var red = new Category { UserId = userId, Name = "Salud", Icon = "❤️", Color = "#ff3b30" };
        h.Db.Categories.AddRange(keep, green, red);
        await h.Db.SaveChangesAsync();

        await CategoryRecolor.RunAsync(h.Db);

        Assert.Equal("#1e7ce8", keep.Color); // el color válido no cambia jamás
        Assert.False(CategoryColors.IsForbidden(green.Color));
        Assert.False(CategoryColors.IsForbidden(red.Color));
        Assert.NotEqual(green.Color, red.Color); // secuencial: sin repeticiones

        // Idempotente: una segunda pasada no toca nada.
        var after = (green.Color, red.Color);
        await CategoryRecolor.RunAsync(h.Db);
        Assert.Equal(after, (green.Color, red.Color));
    }
}
