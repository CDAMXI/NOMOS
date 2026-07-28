using Nomos.Application.Common;
using Nomos.Application.DTOs;
using Nomos.Application.Services;
using Nomos.Domain.Entities;
using Nomos.Infrastructure.Persistence;
using Xunit;

namespace Nomos.Tests;

public class PaletteTests
{
    private static readonly Palettes.Palette Marino = Palettes.Get(Palettes.DefaultName)!;

    [Fact]
    public void NextColor_WalksBaseColorsInOrder_ThenInterpolatesMidpoints()
    {
        Assert.Equal("#16265c", Palettes.NextColor(Marino, []));
        Assert.Equal("#1e3d8f", Palettes.NextColor(Marino, ["#16265c"]));
        // Los 10 base agotados → punto medio del primer par (mezcla RGB al 50%).
        var overflow = Palettes.NextColor(Marino, Marino.Colors);
        Assert.Equal("#1a3276", overflow);
        Assert.DoesNotContain(overflow, Marino.Colors);
    }

    [Fact]
    public void SemanticSlots_MatchByNormalizedName()
    {
        Assert.Equal("#16265c", Palettes.SemanticColor(Marino, "Error"));
        Assert.Equal("#7ea6e8", Palettes.SemanticColor(Marino, "  SALUD "));
        Assert.Null(Palettes.SemanticColor(Marino, "Comida"));
    }

    [Fact]
    public async Task Backfill_MigratesEveryUser_FromNullAndFromOldPalettes()
    {
        using var h = new TestHarness();
        var charlie = new User { Username = "CDAMXI", PasswordHash = "x", Palette = "tierra", CreatedAt = DateTime.UtcNow };
        var sissy = new User { Username = "Sissy", PasswordHash = "x", CreatedAt = DateTime.UtcNow }; // rueda antigua (null)
        h.Db.Users.AddRange(charlie, sissy);
        await h.Db.SaveChangesAsync();

        var comida = new Category { UserId = charlie.Id, Name = "Comida", Icon = "🍱", Color = "#7f4f24" };
        var error = new Category { UserId = charlie.Id, Name = "Error", Icon = "⚠️", Color = "#582f0e" };
        var salud = new Category { UserId = sissy.Id, Name = "Salud", Icon = "❤️", Color = "#b3d345" };
        var ocio = new Category { UserId = sissy.Id, Name = "Ocio", Icon = "🎮", Color = "#8e5be8" };
        h.Db.Categories.AddRange(comida, error, salud, ocio);
        await h.Db.SaveChangesAsync();

        await PaletteBackfill.RunAsync(h.Db);

        Assert.Equal(Palettes.DefaultName, charlie.Palette); // «tierra» también migra: paleta única
        Assert.Equal(Palettes.DefaultName, sissy.Palette);
        Assert.Equal("#16265c", error.Color);               // hueco semántico
        Assert.Equal("#7ea6e8", salud.Color);               // hueco semántico
        Assert.Contains(comida.Color, Marino.Colors);       // primer base libre
        Assert.NotEqual("#16265c", comida.Color);           // sin robar el color reservado
        Assert.Contains(ocio.Color, Marino.Colors);

        // Idempotente: con todos en la paleta por defecto, la segunda pasada no toca nada.
        var snapshot = (comida.Color, error.Color, salud.Color, ocio.Color);
        await PaletteBackfill.RunAsync(h.Db);
        Assert.Equal(snapshot, (comida.Color, error.Color, salud.Color, ocio.Color));
    }

    [Fact]
    public async Task CreateAsync_ForPaletteUser_TakesNextPaletteColor_AndSemanticSlots()
    {
        using var h = new TestHarness();
        var user = new User { Username = "CDAMXI", PasswordHash = "x", Palette = Palettes.DefaultName, CreatedAt = DateTime.UtcNow };
        h.Db.Users.Add(user);
        await h.Db.SaveChangesAsync();

        var service = new CategoryService(h.Categories, h.Expenses, h.Users);
        var first = await service.CreateAsync(user.Id, new CreateCategoryRequest("Comida", null));
        var second = await service.CreateAsync(user.Id, new CreateCategoryRequest("Transporte", "#123456"));
        var semantic = await service.CreateAsync(user.Id, new CreateCategoryRequest("Error", null));

        Assert.Equal("#16265c", first.Color);
        Assert.Equal("#1e3d8f", second.Color); // la preferencia de la API se ignora: manda la paleta
        Assert.Equal("#16265c", semantic.Color); // semántico, aunque el base ya esté repartido
    }

    [Fact]
    public async Task Register_SetsTheDefaultPalette()
    {
        using var h = new TestHarness();
        var dto = await h.Auth.RegisterAsync(new RegisterRequest("nuevo_usuario", "contrasena8", null));
        Assert.Equal(Palettes.DefaultName, dto.Palette);
    }

    [Fact]
    public async Task CategoryRecolor_SkipsPaletteUsers()
    {
        using var h = new TestHarness();
        var user = new User { Username = "CDAMXI", PasswordHash = "x", Palette = Palettes.DefaultName, CreatedAt = DateTime.UtcNow };
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
