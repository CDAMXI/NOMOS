using Microsoft.EntityFrameworkCore;
using Nomos.Application.Common;

namespace Nomos.Infrastructure.Persistence;

/// <summary>
/// One-time, idempotent pass: re-colorea las categorías EXISTENTES cuyo color cae en las zonas
/// vetadas de <see cref="CategoryColors"/> (verde/rojo, que en la app son colores de dato).
/// Cada infractora recibe su color por el algoritmo de inserción respetando los colores válidos
/// del mismo usuario, que se conservan intactos. Tras la primera pasada no queda nada vetado,
/// así que la rutina es un no-op en cada arranque posterior.
/// </summary>
public static class CategoryRecolor
{
    public static async Task RunAsync(NomosDbContext db)
    {
        // Los usuarios con paleta temática quedan fuera: sus colores los gobierna Palettes,
        // no la rueda de tonos, y sus zonas vetadas no aplican.
        var paletteUsers = await db.Users.Where(u => u.Palette != null).Select(u => u.Id).ToListAsync();
        var all = await db.Categories.Where(c => !paletteUsers.Contains(c.UserId)).ToListAsync();
        var offenders = all.Where(c => CategoryColors.IsForbidden(c.Color)).OrderBy(c => c.Id).ToList();
        if (offenders.Count == 0) return; // ya migrado (o BD limpia): nada que hacer

        foreach (var cat in offenders)
        {
            // `all` comparte instancias: las infractoras ya re-coloreadas de este mismo usuario
            // cuentan como ocupadas para las siguientes (secuencial, sin repeticiones).
            var palette = all.Where(c => c.UserId == cat.UserId && c.Id != cat.Id).Select(c => c.Color);
            cat.Color = CategoryColors.Next(palette);
        }
        await db.SaveChangesAsync();
    }
}
