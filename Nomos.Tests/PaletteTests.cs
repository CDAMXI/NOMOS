using Nomos.Application.Common;
using Nomos.Application.DTOs;
using Nomos.Application.Services;
using Nomos.Domain.Entities;
using Nomos.Infrastructure.Persistence;
using Xunit;

namespace Nomos.Tests;

public class PaletteTests
{
    private static readonly Palettes.Palette Apple = Palettes.Get(Palettes.DefaultName)!;

    [Fact]
    public void NextColor_WalksBaseColorsInOrder_ThenInterpolatesMidpoints()
    {
        Assert.Equal("#007aff", Palettes.NextColor(Apple, []));
        Assert.Equal("#5856d6", Palettes.NextColor(Apple, ["#007aff"]));
        // Los 10 base agotados → punto medio del primer par (mezcla RGB al 50%).
        var overflow = Palettes.NextColor(Apple, Apple.Colors);
        Assert.Equal("#2c68ea", overflow);
        Assert.DoesNotContain(overflow, Apple.Colors);
    }

    [Fact]
    public void SemanticSlots_MatchByNormalizedName()
    {
        Assert.Equal("#e68600", Palettes.SemanticColor(Apple, "Error"));
        Assert.Equal("#ff2d55", Palettes.SemanticColor(Apple, "  SALUD "));
        Assert.Null(Palettes.SemanticColor(Apple, "Comida"));
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
        Assert.Equal("#e68600", error.Color);               // hueco semántico
        Assert.Equal("#ff2d55", salud.Color);               // hueco semántico
        Assert.Contains(comida.Color, Apple.Colors);       // primer base libre
        Assert.NotEqual("#e68600", comida.Color);           // sin robar el color reservado
        Assert.Contains(ocio.Color, Apple.Colors);

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
        var first = await service.CreateAsync(user.Id, new CreateCategoryRequest("Comida"));
        var second = await service.CreateAsync(user.Id, new CreateCategoryRequest("Transporte"));
        var semantic = await service.CreateAsync(user.Id, new CreateCategoryRequest("Error"));

        Assert.Equal("#007aff", first.Color);
        Assert.Equal("#5856d6", second.Color);
        Assert.Equal("#e68600", semantic.Color); // semántico, aunque el base ya esté repartido
    }

    [Fact]
    public async Task CreateAsync_RejectsThirteenthCategory()
    {
        using var h = new TestHarness();
        var (userId, _, _) = await h.SeedAsync();
        for (var i = 0; i < 12; i++)
            h.Db.Categories.Add(new Category { UserId = userId, Name = "C" + i, Icon = "🏷️", Color = "#1e7ce8" });
        await h.Db.SaveChangesAsync();

        var service = new CategoryService(h.Categories, h.Expenses, h.Users);
        await Assert.ThrowsAsync<ConflictException>(() =>
            service.CreateAsync(userId, new CreateCategoryRequest("Trece")));
    }

    [Fact]
    public async Task Register_SetsTheDefaultPalette()
    {
        using var h = new TestHarness();
        var dto = await h.Auth.RegisterAsync(new RegisterRequest("nuevo_usuario", "contrasena8", null));
        Assert.Equal(Palettes.DefaultName, dto.Palette);
    }

}
