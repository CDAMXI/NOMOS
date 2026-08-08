using System.Text.RegularExpressions;

namespace Pluto.Application.Common;

public static class ImageDataUrl
{
    // Forma estricta de data-URL de imagen base64: nada de comillas ni caracteres que puedan romper
    // el atributo src del <img> que pinta el cliente (foto de perfil).
    private static readonly Regex Pattern =
        new(@"^data:image/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=\r\n]+$", RegexOptions.Compiled);

    /// <summary>null/vacío → null; supera el tamaño o no casa el patrón → ArgumentException.</summary>
    public static string? Validate(string? dataUrl, int maxLength)
    {
        if (string.IsNullOrEmpty(dataUrl)) return null;
        if (dataUrl.Length > maxLength)
            throw new ArgumentException("La foto es demasiado grande.");
        if (!Pattern.IsMatch(dataUrl))
            throw new ArgumentException("La foto debe ser una imagen válida.");
        return dataUrl;
    }
}
