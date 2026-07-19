using Microsoft.EntityFrameworkCore;

namespace Nomos.Infrastructure.Persistence;

/// <summary>
/// Add/Update/Delete comunes a los repos cuya escritura es directa (Set.Add/Update/Remove + SaveChanges).
/// Los repos cuya entidad llega ya rastreada (p. ej. Trip desde GetDetailAsync) sobrescriben UpdateAsync
/// para NO re-marcar todo el grafo como Modified (rompería el alta/baja de la colección de monedas).
/// Como estos métodos son públicos y su firma coincide (T = la entidad del repo), satisfacen el miembro
/// correspondiente de la interfaz del repo sin necesidad de envoltorios. El contexto se expone como campo
/// protegido `db` para que los repos derivados lo usen en sus consultas sin capturarlo por segunda vez.
/// </summary>
public abstract class RepositoryBase<T>(NomosDbContext context) where T : class
{
    protected readonly NomosDbContext db = context;

    public async Task<T> AddAsync(T entity)
    {
        db.Set<T>().Add(entity);
        await db.SaveChangesAsync();
        return entity;
    }

    public virtual async Task UpdateAsync(T entity)
    {
        db.Set<T>().Update(entity);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(T entity)
    {
        db.Set<T>().Remove(entity);
        await db.SaveChangesAsync();
    }
}
