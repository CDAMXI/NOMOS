using Microsoft.EntityFrameworkCore;

namespace Pluto.Infrastructure.Persistence;

/// <summary>
/// Add/Update/Delete comunes a los repos cuya escritura es directa (Set.Add/Update/Remove + SaveChanges).
/// El contexto se expone como campo protegido `db` para las consultas de los repos derivados.
/// </summary>
public abstract class RepositoryBase<T>(PlutoDbContext context) where T : class
{
    protected readonly PlutoDbContext db = context;

    public async Task<T> AddAsync(T entity)
    {
        db.Set<T>().Add(entity);
        await db.SaveChangesAsync();
        return entity;
    }

    public async Task UpdateAsync(T entity)
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
