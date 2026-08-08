using Pluto.Application.Common;
using Pluto.Application.DTOs;
using Pluto.Application.Interfaces;
using Pluto.Domain.Entities;

namespace Pluto.Application.Services;

public class CategoryService(ICategoryRepository categories, IExpenseRepository expenses, IUserRepository users)
{
    private const int MaxNameLength = 40;
    // Tope duro: por encima de ~12 categorías los tonos dejan de ser distinguibles para
    // cualquiera y el sistema de color se degrada solo.
    private const int MaxCategories = 12;

    public async Task<List<CategoryDto>> GetAllAsync(int userId) =>
        (await categories.GetAllAsync(userId)).Select(ToDto).ToList();

    /// <summary>Creates the six starter categories for a brand-new user.</summary>
    public async Task SeedDefaultsAsync(int userId)
    {
        var defaults = DefaultCategories.All.Select(d => new Category
        {
            UserId = userId,
            Name = d.Name,
            Icon = d.Icon,
            Color = d.Color
        });
        await categories.AddRangeAsync(defaults);
    }

    public async Task<CategoryDto> CreateAsync(int userId, CreateCategoryRequest request)
    {
        var name = ValidateName(request.Name);
        if (await categories.NameTakenAsync(userId, name))
            throw new ConflictException("Ya tienes una categoría con ese nombre.");

        var existing = await categories.GetAllAsync(userId);
        if (existing.Count >= MaxCategories)
            throw new ConflictException($"Ya tienes {MaxCategories} categorías, el máximo. Reutiliza o elimina alguna existente.");

        var category = await categories.AddAsync(new Category
        {
            UserId = userId,
            Name = name,
            Icon = CategoryIcon.ForName(name),
            Color = await PickColorAsync(userId, name, existing)
        });
        return ToDto(category);
    }

    public async Task<CategoryDto?> UpdateAsync(int id, int userId, UpdateCategoryRequest request)
    {
        var category = await categories.GetByIdAsync(id, userId);
        if (category is null) return null;

        var name = ValidateName(request.Name);
        if (await categories.NameTakenAsync(userId, name, excludeId: id))
            throw new ConflictException("Ya tienes una categoría con ese nombre.");

        category.Name = name;
        category.Icon = CategoryIcon.ForName(name); // icon follows the theme of the name
        // Un renombrado a nombre semántico («error», «salud») arrastra su color reservado,
        // igual que el icono sigue al nombre.
        if (Palettes.SemanticColor(await UserPaletteAsync(userId), name) is string semantic)
            category.Color = semantic;
        await categories.UpdateAsync(category);
        return ToDto(category);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var category = await categories.GetByIdAsync(id, userId);
        if (category is null) return false;
        if (await expenses.AnyForCategoryAsync(id, userId))
            throw new ConflictException("No puedes eliminar una categoría que tiene gastos. Reasigna o borra esos gastos primero.");
        await categories.DeleteAsync(category);
        return true;
    }

    private static string ValidateName(string? name)
    {
        var trimmed = name?.Trim() ?? "";
        if (trimmed.Length == 0)
            throw new ArgumentException("El nombre de la categoría es obligatorio.");
        if (trimmed.Length > MaxNameLength)
            throw new ArgumentException($"El nombre no puede superar {MaxNameLength} caracteres.");
        return trimmed;
    }

    /// <summary>Color semántico si el nombre lo tiene reservado; si no, el siguiente de la paleta.</summary>
    private async Task<string> PickColorAsync(int userId, string name, List<Category> existing)
    {
        var palette = await UserPaletteAsync(userId);
        return Palettes.SemanticColor(palette, name)
            ?? Palettes.NextColor(palette, existing.Select(c => c.Color));
    }

    /// <summary>Todo usuario lleva paleta desde el alta; ante un nombre desconocido, la de la app.</summary>
    private async Task<Palettes.Palette> UserPaletteAsync(int userId) =>
        Palettes.Get((await users.GetByIdAsync(userId))?.Palette) ?? Palettes.Get(Palettes.DefaultName)!;

    private static CategoryDto ToDto(Category c) => new(c.Id, c.Name, c.Icon, c.Color);
}
