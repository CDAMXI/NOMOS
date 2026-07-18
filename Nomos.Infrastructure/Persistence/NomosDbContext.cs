using Microsoft.EntityFrameworkCore;
using Nomos.Domain.Entities;

namespace Nomos.Infrastructure.Persistence;

public class NomosDbContext(DbContextOptions<NomosDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Income> Incomes => Set<Income>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Holding> Holdings => Set<Holding>();
    public DbSet<Trip> Trips => Set<Trip>();
    public DbSet<TripCurrency> TripCurrencies => Set<TripCurrency>();
    public DbSet<TripExpense> TripExpenses => Set<TripExpense>();
    public DbSet<NetWorthSnapshot> Snapshots => Set<NetWorthSnapshot>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<User>(e =>
        {
            e.Property(u => u.Username).HasMaxLength(30);
            e.HasIndex(u => u.Username).IsUnique();
            e.Property(u => u.PasswordHash).HasMaxLength(200);
        });

        builder.Entity<Category>(e =>
        {
            e.Property(c => c.Name).HasMaxLength(40);
            e.Property(c => c.Icon).HasMaxLength(16);
            e.Property(c => c.Color).HasMaxLength(9);
            e.HasOne<User>()
             .WithMany()
             .HasForeignKey(c => c.UserId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(c => new { c.UserId, c.Name }).IsUnique();
        });

        builder.Entity<Expense>(e =>
        {
            e.Property(x => x.Description).HasMaxLength(120);
            e.HasOne(x => x.Category)
             .WithMany(c => c.Expenses)
             .HasForeignKey(x => x.CategoryId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne<User>()
             .WithMany()
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne<Account>()
             .WithMany()
             .HasForeignKey(x => x.AccountId)
             .OnDelete(DeleteBehavior.SetNull);
            e.HasIndex(x => new { x.UserId, x.Date });
        });

        builder.Entity<Income>(e =>
        {
            e.Property(x => x.Description).HasMaxLength(120);
            e.HasOne<User>()
             .WithMany()
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne<Account>()
             .WithMany()
             .HasForeignKey(x => x.AccountId)
             .OnDelete(DeleteBehavior.SetNull);
            e.HasIndex(x => new { x.UserId, x.Date });
        });

        builder.Entity<Account>(e =>
        {
            e.Property(a => a.Name).HasMaxLength(80);
            e.Property(a => a.Type).HasConversion<string>().HasMaxLength(20);
            e.HasOne<User>()
             .WithMany()
             .HasForeignKey(a => a.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Holding>(e =>
        {
            e.Property(h => h.Symbol).HasMaxLength(40);
            // Las posiciones viven y mueren con su cuenta broker; el usuario cascada vía la cuenta.
            e.HasOne<Account>()
             .WithMany()
             .HasForeignKey(h => h.AccountId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne<User>()
             .WithMany()
             .HasForeignKey(h => h.UserId)
             .OnDelete(DeleteBehavior.NoAction);
            e.HasIndex(h => new { h.UserId, h.AccountId });
        });

        builder.Entity<Trip>(e =>
        {
            e.Property(t => t.Name).HasMaxLength(80);
            e.Property(t => t.Destinations).HasMaxLength(200);
            e.HasOne<User>()
             .WithMany()
             .HasForeignKey(t => t.UserId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasMany(t => t.Currencies)
             .WithOne()
             .HasForeignKey(c => c.TripId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasMany(t => t.Expenses)
             .WithOne()
             .HasForeignKey(x => x.TripId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<TripCurrency>(e =>
        {
            e.Property(c => c.Code).HasMaxLength(8);
            e.Property(c => c.RateToEur).HasPrecision(20, 6);
            e.HasIndex(c => new { c.TripId, c.Code }).IsUnique();
        });

        builder.Entity<TripExpense>(e =>
        {
            e.Property(x => x.Description).HasMaxLength(120);
            e.Property(x => x.CurrencyCode).HasMaxLength(8);
            e.HasOne(x => x.Category)
             .WithMany()
             .HasForeignKey(x => x.CategoryId)
             .OnDelete(DeleteBehavior.SetNull);
            // El usuario cascada vía el viaje; evita rutas de cascada múltiples (igual que Holding).
            e.HasOne<User>()
             .WithMany()
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.NoAction);
            e.HasIndex(x => new { x.UserId, x.TripId });
        });

        builder.Entity<NetWorthSnapshot>(e =>
        {
            e.Ignore(s => s.Net);
            e.HasOne<User>()
             .WithMany()
             .HasForeignKey(s => s.UserId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(s => new { s.UserId, s.Date }).IsUnique();
        });
    }
}
