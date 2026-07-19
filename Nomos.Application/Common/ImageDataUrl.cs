using System.Text.RegularExpressions;

namespace Nomos.Application.Common;

public static class ImageDataUrl
{
    // Forma estricta de data-URL de imagen base64: nada de comillas ni caracteres que puedan romper
    // el atributo src del <img> que pinta el cliente. Compartido por foto de perfil y factura de viaje.
    private static readonly Regex Pattern =
        new(@"^data:image/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=\r\n]+$", RegexOptions.Compiled);

    /// <summary>null/vacío → null; supera el tamaño → tooBigMessage; no casa el patrón → invalidMessage.</summary>
    public static string? Validate(string? dataUrl, int maxLength, string tooBigMessage, string invalidMessage)
    {
        if (string.IsNullOrEmpty(dataUrl)) return null;
        if (dataUrl.Length > maxLength)
            throw new ArgumentException(tooBigMessage);
        if (!Pattern.IsMatch(dataUrl))
            throw new ArgumentException(invalidMessage);
        return dataUrl;
    }
}
