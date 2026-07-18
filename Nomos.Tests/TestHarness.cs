using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Nomos.Application.Services;
using Nomos.Domain.Entities;
using Nomos.Infrastructure.Persistence;

namespace Nomos.Tests;

/// <summary>
/// Base de datos SQLite en memoria (real, con transacciones) montada por test, con los repos y
/// servicios cableados a mano sobre un único DbContext — igual que en producción vía DI.
/// </summary>
public sealed class TestHarness : IDisposable
{
    private readonly SqliteConnection _conn;
    public NomosDbContext Db { get; }

    public TestHarness()
    {
        // ":memory:" vive mientras la conexión esté abierta; la mantenemos hasta Dispose.
        _conn = new SqliteConnection("DataSource=:memory:");
        _conn.Open();
        Db = new NomosDbContext(new DbContextOptionsBuilder<NomosDbContext>().UseSqlite(_conn).Options);
        Db.Database.EnsureCreated();
    }

    public AccountRepository Accounts => new(Db);
    public HoldingRepository Holdings => new(Db);
    public ExpenseRepository Expenses => new(Db);
    public IncomeRepository Incomes => new(Db);
    public SnapshotRepository Snapshots => new(Db);
    public TripRepository Trips => new(Db);
    public CategoryRepository Categories => new(Db);
    public UnitOfWork UnitOfWork => new(Db);

    public SnapshotWriter SnapshotWriter => new(Accounts, Snapshots, Expenses, Incomes, Holdings);
    public InvestmentService Investment => new(Accounts, Holdings, Expenses, Incomes, SnapshotWriter, UnitOfWork);
    public TripService Trip => new(Trips, Categories);

    /// <summary>Crea un usuario con una cuenta de efectivo y (opcional) una de inversión.</summary>
    public async Task<(int userId, int cashId, int brokerId)> SeedAsync(decimal cash = 0, decimal margin = 0)
    {
        var user = new User { Username = "u" + Guid.NewGuid().ToString("N")[..8], PasswordHash = "x", CreatedAt = DateTime.UtcNow };
        Db.Users.Add(user);
        await Db.SaveChangesAsync();

        var cashAcc = new Account { UserId = user.Id, Name = "Efectivo", Type = AccountType.Cash, Balance = cash, UpdatedAt = DateTime.UtcNow };
        var broker = new Account { UserId = user.Id, Name = "Broker", Type = AccountType.Investment, Balance = margin, UpdatedAt = DateTime.UtcNow };
        Db.Accounts.AddRange(cashAcc, broker);
        await Db.SaveChangesAsync();
        return (user.Id, cashAcc.Id, broker.Id);
    }

    public void Dispose()
    {
        Db.Dispose();
        _conn.Dispose();
    }
}
