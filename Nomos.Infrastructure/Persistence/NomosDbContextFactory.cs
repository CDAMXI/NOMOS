using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Nomos.Infrastructure.Persistence;

/// <summary>
/// Design-time factory so `dotnet ef` can build the model without running the API host.
/// The connection string here is only used for migration scaffolding, never at runtime.
/// </summary>
public class NomosDbContextFactory : IDesignTimeDbContextFactory<NomosDbContext>
{
    public NomosDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<NomosDbContext>()
            .UseNpgsql("Host=localhost;Database=nomos_design;Username=postgres;Password=postgres")
            .Options;
        return new NomosDbContext(options);
    }
}
