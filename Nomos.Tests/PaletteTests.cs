using Nomos.Application.Common;
using Nomos.Application.DTOs;
using Nomos.Application.Services;
using Nomos.Domain.Entities;
using Nomos.Infrastructure.Persistence;
using Xunit;

namespace Nomos.Tests;

public class PaletteTests
{
    private static readonly Palettes.Palette Indigo = Palettes.Get(Palettes.DefaultName)!;

    [Fact]
    public void NextColor_WalksBaseColorsInOrder_ThenInterpolatesMidpoints()
    {
        Assert.Equal("#1b2447", Palettes.NextColor(Indigo, []));
        Assert.Equal("#27367d", Palettes.NextColor(Indigo, ["#1b2447"]));
        // Los 10 base agotados → punto medio del primer par (mezcla RGB al 50%).
        var overflow = Palettes.NextColor(Indigo, Indigo.Colors);
        Assert.Equal("#212d62", overflow);
        Assert.DoesNotContain(overflow, Indigo.Colors);
    }

    [Fact]
    public void SemanticSlots_MatchByNormalizedName()
    {
        Assert.Equal("#1b2447", Palettes.SemanticColor(Indigo, "Error"));
        Assert.Equal("#93a5ec", Palettes.SemanticColor(Indigo, "  SALUD "));
        Assert.Null(Palettes.SemanticColor(Indigo, "Comida"));
    }

    [Fact]
    public async Task Backfill_MigratesEveryUser_FromNullAndFromOldPalettes()
    {
        using var h = new TestHarness();
        var charlie = new User { Username = "CDAMXI", PasswordHash = "x", Palette = "marino", CreatedAt = DateTime.UtcNow };
        var sissy = new User { Username = "Sissy", PasswordHash = "x", CreatedAt = DateTime.UtcNow }; // rueda antigua (null)
        h.Db.Users.AddRange(charlie, sissy);
        await h.Db.SaveChangesAsync();

        var comida = new Category { UserId = charlie.Id, Name = "Comida", Icon = "🍱", Color = "#1e3d8f" };
        var error = new Category { UserId = charlie.Id, Name = "Error", Icon = "⚠️", Color = "#16265c" };
        var salud = new Category { UserId = sissy.Id, Name = "Salud", Icon = "❤️", Color = "#b3d345" };
        var ocio = new Category { UserId = sissy.Id, Name = "Ocio", Icon = "🎮", Color = "#8e5be8" };
        h.Db.Categories.AddRange(comida, error, salud, ocio);
        await h.Db.SaveChangesAsync();

        await PaletteBackfill.RunAsync(h.Db);

        Assert.Equal(Palettes.DefaultName, charlie.Palette); // la paleta anterior también migra: paleta única
        Assert.Equal(Palettes.DefaultName, sissy.Palette);
        Assert.Equal("#1b2447", error.Color);               // hueco semántico
        Assert.Equal("#93a5ec", salud.Color);               // hueco semántico
        Assert.Contains(comida.Color, Indigo.Colors);       // primer base libre
        Assert.NotEqual("#1b2447", comida.Color);           // sin robar el color reservado
        Assert.Contains(ocio.Color, Indigo.Colors);

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

        Assert.Equal("#1b2447", first.Color);
        Assert.Equal("#27367d", second.Color); // la preferencia de la API se ignora: manda la paleta
        Assert.Equal("#1b2447", semantic.Color); // semántico, aunque el base ya esté repartido
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
