using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Nomos.Application.Common;

namespace Nomos.Api;

/// <summary>
/// Red de seguridad para excepciones que escapan de los endpoints: traduce los tipos conocidos a
/// un código y un mensaje claros (mismo formato de cuerpo que el resto: una cadena JSON), y registra
/// los 500 inesperados para tener rastro en producción.
/// </summary>
public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext http, Exception ex, CancellationToken ct)
    {
        var (status, message) = ex switch
        {
            ConflictException => (StatusCodes.Status409Conflict, ex.Message),
            ArgumentException => (StatusCodes.Status400BadRequest, ex.Message),
            DbUpdateConcurrencyException => (StatusCodes.Status409Conflict,
                "Otra operación modificó los datos a la vez. Vuelve a intentarlo."),
            _ => (StatusCodes.Status500InternalServerError, "Ha ocurrido un error inesperado."),
        };

        if (status == StatusCodes.Status500InternalServerError)
            logger.LogError(ex, "Excepción no controlada en {Path}", http.Request.Path);

        http.Response.StatusCode = status;
        await http.Response.WriteAsJsonAsync(message, ct);
        return true;
    }
}
