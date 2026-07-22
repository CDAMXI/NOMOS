using System.Text.RegularExpressions;
using Nomos.Application.Common;
using Nomos.Application.DTOs;
using Nomos.Application.Interfaces;
using Nomos.Domain.Entities;

namespace Nomos.Application.Services;

public partial class AuthService(IUserRepository users)
{
    private const int MaxPhotoLength = 500_000; // ~366 KB decoded; avatars are resized client-side

    // Divisas soportadas (ISO 4217). Espejo de CURRENCIES en el front (js/format.js).
    private static readonly HashSet<string> SupportedCurrencies = new(StringComparer.OrdinalIgnoreCase)
    {
        "EUR", "USD", "GBP", "CHF", "JPY", "CNY", "CAD", "AUD",
        "MXN", "COP", "ARS", "CLP", "PEN", "BRL", "UYU", "BOB", "VES", "PYG", "GTQ", "DOP"
    };

    // Letters (incl. accents/ñ via \p{L}), digits, spaces and . _ - ; 3–30 chars.
    [GeneratedRegex(@"^[\p{L}\p{N} ._-]{3,30}$")]
    private static partial Regex UsernamePattern();

    public async Task<UserDto> RegisterAsync(RegisterRequest request)
    {
        var username = ValidateUsername(request.Username);
        ValidatePassword(request.Password);
        var photo = ValidatePhoto(request.PhotoDataUrl);

        if (await users.UsernameTakenAsync(username))
            throw new ConflictException("Ese nombre de usuario ya está en uso.");

        var user = await users.AddAsync(new User
        {
            Username = username,
            PasswordHash = PasswordHasher.Hash(request.Password),
            PhotoDataUrl = photo,
            CreatedAt = DateTime.UtcNow
        });
        return ToDto(user);
    }

    public async Task<UserDto?> ValidateLoginAsync(LoginRequest request)
    {
        var user = await users.GetByUsernameAsync(request.Username?.Trim() ?? "");
        if (user is null || !PasswordHasher.Verify(request.Password ?? "", user.PasswordHash))
            return null;
        return ToDto(user);
    }

    public async Task<UserDto?> GetAsync(int id)
    {
        var user = await users.GetByIdAsync(id);
        return user is null ? null : ToDto(user);
    }

    public async Task<UserDto> UpdateProfileAsync(int id, UpdateProfileRequest request)
    {
        var user = await users.GetByIdAsync(id)
            ?? throw new ArgumentException("Usuario no encontrado.");

        if (!string.IsNullOrWhiteSpace(request.Username))
        {
            var username = ValidateUsername(request.Username);
            if (!username.Equals(user.Username, StringComparison.OrdinalIgnoreCase)
                && await users.UsernameTakenAsync(username, excludeUserId: id))
                throw new ConflictException("Ese nombre de usuario ya está en uso.");
            user.Username = username;
        }

        if (request.PhotoDataUrl is not null)
            user.PhotoDataUrl = ValidatePhoto(request.PhotoDataUrl);

        if (request.Currency is not null)
            user.Currency = ValidateCurrency(request.Currency);

        await users.UpdateAsync(user);
        return ToDto(user);
    }

    public async Task ChangePasswordAsync(int id, ChangePasswordRequest request)
    {
        var user = await users.GetByIdAsync(id)
            ?? throw new ArgumentException("Usuario no encontrado.");

        if (!PasswordHasher.Verify(request.CurrentPassword ?? "", user.PasswordHash))
            throw new ArgumentException("La contraseña actual no es correcta.");

        ValidatePassword(request.NewPassword);
        user.PasswordHash = PasswordHasher.Hash(request.NewPassword);
        await users.UpdateAsync(user);
    }

    private static string ValidateUsername(string? username)
    {
        var trimmed = username?.Trim() ?? "";
        if (!UsernamePattern().IsMatch(trimmed))
            throw new ArgumentException("El nombre de usuario debe tener entre 3 y 30 caracteres (letras, números, espacios, punto, guion o guion bajo).");
        return trimmed;
    }

    private static void ValidatePassword(string? password)
    {
        if (string.IsNullOrEmpty(password) || password.Length < 8)
            throw new ArgumentException("La contraseña debe tener al menos 8 caracteres.");
        if (password.Length > 128)
            throw new ArgumentException("La contraseña es demasiado larga.");
    }

    private static string? ValidatePhoto(string? photoDataUrl) =>
        ImageDataUrl.Validate(photoDataUrl, MaxPhotoLength, "La foto es demasiado grande.", "La foto debe ser una imagen válida.");

    private static string ValidateCurrency(string code)
    {
        var c = code.Trim().ToUpperInvariant();
        if (!SupportedCurrencies.Contains(c))
            throw new ArgumentException("Divisa no soportada.");
        return c;
    }

    private static UserDto ToDto(User u) => new(u.Id, u.Username, u.PhotoDataUrl, u.Currency);
}
