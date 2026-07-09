using Nomos.Application.Common;
using Nomos.Application.DTOs;
using Nomos.Application.Interfaces;
using Nomos.Domain.Entities;

namespace Nomos.Application.Services;

public class CategoryService(ICategoryRepository categories, IExpenseRepository expenses)
{
    private const int MaxNameLength = 40;

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
        var category = await categories.AddAsync(new Category
        {
            UserId = userId,
            Name = name,
            Icon = CategoryIcon.ForName(name),
            Color = NormalizeColor(request.Color) ?? DefaultCategories.PickColor(existing.Count)
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
        var color = NormalizeColor(request.Color);
        if (color is not null) category.Color = color;
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

    /// <summary>Accepts a #RGB or #RRGGBB hex colour; returns null when nothing usable was provided.</summary>
    private static string? NormalizeColor(string? color)
    {
        if (string.IsNullOrWhiteSpace(color)) return null;
        var c = color.Trim();
        if (!System.Text.RegularExpressions.Regex.IsMatch(c, "^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$"))
            throw new ArgumentException("El color no es válido.");
        return c.ToLowerInvariant();
    }

    private static CategoryDto ToDto(Category c) => new(c.Id, c.Name, c.Icon, c.Color);
}
