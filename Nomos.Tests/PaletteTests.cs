using Nomos.Application.Common;
using Nomos.Application.DTOs;
using Nomos.Application.Services;
using Nomos.Domain.Entities;
using Nomos.Infrastructure.Persistence;
using Xunit;

namespace Nomos.Tests;

public class PaletteTests
{
    private static readonly Palettes.Palette Tierra = Palettes.Get("tierra")!;

    [Fact]
    public void NextColor_WalksBaseColorsInOrder_ThenInterpolatesMidpoints()
    {
        Assert.Equal("#582f0e", Palettes.NextColor(Tierra, []));
        Assert.Equal("#7f4f24", Palettes.NextColor(Tierra, ["#582f0e"]));
        // Los 10 base agotados → punto medio del primer par (mezcla RGB al 50%).
        var overflow = Palettes.NextColor(Tierra, Tierra.Colors);
        Assert.Equal("#6c3f19", overflow);
        Assert.DoesNotContain(overflow, Tierra.Colors);
    }

    [Fact]
    public void SemanticSlots_MatchByNormalizedName()
    {
        Assert.Equal("#582f0e", Palettes.SemanticColor(Tierra, "Error"));
        Assert.Equal("#c2c5aa", Palettes.SemanticColor(Tierra, "  SALUD "));
        Assert.Null(Palettes.SemanticColor(Tierra, "Comida"));
    }

    [Fact]
    public async Task Backfill_SwitchesCharlieToTierra_AndRepalettesEverything()
    {
        using var h = new TestHarness();
        var charlie = new User { Username = "CDAMXI", PasswordHash = "x", CreatedAt = DateTime.UtcNow };
        var other = new User { Username = "Sissy", PasswordHash = "x", CreatedAt = DateTime.UtcNow };
        h.Db.Users.AddRange(charlie, other);
        await h.Db.SaveChangesAsync();

        var comida = new Category { UserId = charlie.Id, Name = "Comida", Icon = "🍱", Color = "#f5a623" };
        var error = new Category { UserId = charlie.Id, Name = "Error", Icon = "⚠️", Color = "#c3d345" };
        var salud = new Category { UserId = charlie.Id, Name = "Salud", Icon = "❤️", Color = "#454cd3" };
        var ajena = new Category { UserId = other.Id, Name = "Comida", Icon = "🍱", Color = "#f5a623" };
        h.Db.Categories.AddRange(comida, error, salud, ajena);
        await h.Db.SaveChangesAsync();

        await PaletteBackfill.RunAsync(h.Db);

        Assert.Equal("tierra", charlie.Palette);
        Assert.Equal("#582f0e", error.Color);              // hueco semántico
        Assert.Equal("#c2c5aa", salud.Color);              // hueco semántico
        Assert.Contains(comida.Color, Tierra.Colors);      // re-paletteada al primer base libre
        Assert.NotEqual("#582f0e", comida.Color);          // sin robar el color reservado
        Assert.Equal("#f5a623", ajena.Color);              // otros usuarios intactos
        Assert.Null(other.Palette);

        // Idempotente: gated en Palette == null.
        var snapshot = (comida.Color, error.Color, salud.Color);
        await PaletteBackfill.RunAsync(h.Db);
        Assert.Equal(snapshot, (comida.Color, error.Color, salud.Color));
    }

    [Fact]
    public async Task CreateAsync_ForPaletteUser_TakesNextPaletteColor_AndSemanticSlots()
    {
        using var h = new TestHarness();
        var user = new User { Username = "CDAMXI", PasswordHash = "x", Palette = "tierra", CreatedAt = DateTime.UtcNow };
        h.Db.Users.Add(user);
        await h.Db.SaveChangesAsync();

        var service = new CategoryService(h.Categories, h.Expenses, h.Users);
        var first = await service.CreateAsync(user.Id, new CreateCategoryRequest("Comida", null));
        var second = await service.CreateAsync(user.Id, new CreateCategoryRequest("Transporte", "#123456"));
        var semantic = await service.CreateAsync(user.Id, new CreateCategoryRequest("Error", null));

        Assert.Equal("#582f0e", first.Color);
        Assert.Equal("#7f4f24", second.Color); // la preferencia de la API se ignora: manda la paleta
        Assert.Equal("#582f0e", semantic.Color); // semántico, aunque el base ya esté repartido
    }

    [Fact]
    public async Task CategoryRecolor_SkipsPaletteUsers()
    {
        using var h = new TestHarness();
        var user = new User { Username = "CDAMXI", PasswordHash = "x", Palette = "tierra", CreatedAt = DateTime.UtcNow };
        h.Db.Users.Add(user);
        await h.Db.SaveChangesAsync();
        // Verde vetado para la rueda, pero el usuario tiene paleta: no se toca.
        var cat = new Category { UserId = user.Id, Name = "X", Icon = "🏷️", Color = "#34c759" };
        h.Db.Categories.Add(cat);
        await h.Db.SaveChangesAsync();

        await CategoryRecolor.RunAsync(h.Db);
        Assert.Equal("#34c759", cat.Color);
    }
}
