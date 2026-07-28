using Microsoft.EntityFrameworkCore;
using Nomos.Application.Common;

namespace Nomos.Infrastructure.Persistence;

/// <summary>
/// Pasada idempotente (decisión de Charlie, 2026-07-28, no negociable): TODOS los usuarios
/// llevan la paleta única de la app (<see cref="Palettes.DefaultName"/>). Cada usuario que aún
/// no la tenga — nulls de la rueda antigua o paletas anteriores como «tierra» — se migra y sus
/// categorías se re-palettean: huecos semánticos primero, resto por orden de Id con los colores
/// base y, si hacen falta más, los interpolados. Tras la pasada todo usuario queda en la paleta
/// por defecto (el alta ya la fija), así que en arranques posteriores es un no-op.
/// </summary>
public static class PaletteBackfill
{
    public static async Task RunAsync(NomosDbContext db)
    {
        var pending = await db.Users.Where(u => u.Palette != Palettes.DefaultName).ToListAsync();
        if (pending.Count == 0) return; // todos migrados: nada que hacer

        var palette = Palettes.Get(Palettes.DefaultName)!;
        foreach (var user in pending)
        {
            user.Palette = Palettes.DefaultName;
            var cats = await db.Categories.Where(c => c.UserId == user.Id).OrderBy(c => c.Id).ToListAsync();

            // Primero los semánticos: reservan su color y el reparto general ya no lo reutiliza.
            foreach (var cat in cats)
                if (Palettes.SemanticColor(palette, cat.Name) is string semantic)
                    cat.Color = semantic;

            var taken = cats.Where(c => Palettes.SemanticColor(palette, c.Name) is not null)
                .Select(c => c.Color).ToList();
            foreach (var cat in cats)
            {
                if (Palettes.SemanticColor(palette, cat.Name) is not null) continue;
                cat.Color = Palettes.NextColor(palette, taken);
                taken.Add(cat.Color);
            }
        }
        await db.SaveChangesAsync();
    }
}
