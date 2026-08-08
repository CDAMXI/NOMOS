using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Pluto.Infrastructure.Persistence;

/// <summary>
/// Design-time factory so `dotnet ef` can build the model without running the API host.
/// The connection string here is only used for migration scaffolding, never at runtime.
/// </summary>
public class PlutoDbContextFactory : IDesignTimeDbContextFactory<PlutoDbContext>
{
    public PlutoDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<PlutoDbContext>()
            .UseNpgsql("Host=localhost;Database=pluto_design;Username=postgres;Password=postgres")
            .Options;
        return new PlutoDbContext(options);
    }
}
