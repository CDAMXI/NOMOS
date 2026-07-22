using Microsoft.EntityFrameworkCore;
using Nomos.Application.Common;
using Nomos.Application.DTOs;
using Nomos.Domain.Entities;
using Xunit;

namespace Nomos.Tests;

public class AccountDeletionTests
{
    /// <summary>Siembra un usuario con contraseña real, una posición de broker y un gasto (para probar la cascada).</summary>
    private static async Task<int> SeedUserWithDataAsync(TestHarness h, string password)
    {
        var (userId, cashId, brokerId) = await h.SeedAsync(cash: 100, margin: 50);
        var user = await h.Db.Users.FindAsync(userId);
        user!.PasswordHash = PasswordHasher.Hash(password);

        var cat = new Category { UserId = userId, Name = "Comida", Icon = "🍔", Color = "#123456" };
        h.Db.Categories.Add(cat);
        await h.Db.SaveChangesAsync();
        h.Db.Expenses.Add(new Expense
        {
            UserId = userId, Amount = 5, CategoryId = cat.Id, Description = "x",
            Date = DateOnly.FromDateTime(DateTime.UtcNow.Date), AccountId = cashId
        });
        h.Db.Holdings.Add(new Holding
        {
            UserId = userId, AccountId = brokerId, Symbol = "AAPL", Shares = 1, BuyPrice = 10,
            BuyDate = DateOnly.FromDateTime(DateTime.UtcNow.Date)
        });
        await h.Db.SaveChangesAsync();
        return userId;
    }

    [Fact]
    public async Task Delete_WrongPassword_Throws_AndKeepsEverything()
    {
        using var h = new TestHarness();
        var userId = await SeedUserWithDataAsync(h, "secreta123");

        await Assert.ThrowsAsync<ArgumentException>(() =>
            h.Auth.DeleteAccountAsync(userId, new DeleteAccountRequest("incorrecta")));

        Assert.Equal(1, await h.Db.Users.AsNoTracking().CountAsync(u => u.Id == userId));
        Assert.Equal(2, await h.Db.Accounts.AsNoTracking().CountAsync(a => a.UserId == userId));
    }

    [Fact]
    public async Task Delete_CorrectPassword_RemovesUser_AndCascadesAllData()
    {
        using var h = new TestHarness();
        var userId = await SeedUserWithDataAsync(h, "secreta123");

        await h.Auth.DeleteAccountAsync(userId, new DeleteAccountRequest("secreta123"));

        Assert.Equal(0, await h.Db.Users.AsNoTracking().CountAsync(u => u.Id == userId));
        Assert.Equal(0, await h.Db.Accounts.AsNoTracking().CountAsync(a => a.UserId == userId));
        Assert.Equal(0, await h.Db.Categories.AsNoTracking().CountAsync(c => c.UserId == userId));
        Assert.Equal(0, await h.Db.Expenses.AsNoTracking().CountAsync(e => e.UserId == userId));
        Assert.Equal(0, await h.Db.Holdings.AsNoTracking().CountAsync(x => x.UserId == userId));
    }
}
