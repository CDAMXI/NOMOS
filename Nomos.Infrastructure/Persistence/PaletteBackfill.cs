using Microsoft.EntityFrameworkCore;
using Nomos.Application.Common;

namespace Nomos.Infrastructure.Persistence;

/// <summary>
/// One-time, idempotent pass (petición explícita de Charlie, 2026-07-27): su usuario pasa a la
/// paleta «tierra» y TODAS sus categorías se re-palettean — primero los huecos semánticos
/// («error», «salud»), después el resto por orden de Id con los colores base y, si hacen falta
/// más, los interpolados. Gated en User.Palette == null: tras la primera pasada no vuelve a
/// tocar nada (los re-paletteos posteriores serían destruir asociaciones ya aprendidas).
/// </summary>
public static class PaletteBackfill
{
    private const string Username = "CDAMXI";
    private const string PaletteName = "tierra";

    public static async Task RunAsync(NomosDbContext db)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Username == Username && u.Palette == null);
        if (user is null) return; // ya migrado (o el usuario no existe en esta BD)

        var palette = Palettes.Get(PaletteName)!;
        user.Palette = PaletteName;

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
        await db.SaveChangesAsync();
    }
}
