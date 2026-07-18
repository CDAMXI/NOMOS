namespace Nomos.Application.Common;

/// <summary>
/// La "fecha de hoy" del usuario, fijada a la zona horaria de España — no la del servidor (Render
/// corre en UTC). Evita que un gasto a las 00:30 en Madrid se guarde con la fecha del día anterior.
/// </summary>
public static class AppClock
{
    private static readonly TimeZoneInfo Spain = ResolveSpain();

    public static DateOnly Today() =>
        DateOnly.FromDateTime(TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, Spain).DateTime);

    // Acepta el id IANA (Linux) y el de Windows; si no hay ninguno, cae a UTC sin romper.
    private static TimeZoneInfo ResolveSpain()
    {
        foreach (var id in new[] { "Europe/Madrid", "Romance Standard Time" })
        {
            try { return TimeZoneInfo.FindSystemTimeZoneById(id); }
            catch (TimeZoneNotFoundException) { }
            catch (InvalidTimeZoneException) { }
        }
        return TimeZoneInfo.Utc;
    }
}
