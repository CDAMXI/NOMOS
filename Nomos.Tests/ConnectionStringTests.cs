using Npgsql;
using Nomos.Infrastructure;
using Xunit;

namespace Nomos.Tests;

public class ConnectionStringTests
{
    [Fact]
    public void PostgresUri_ConvertsToValidNpgsqlKeyValue()
    {
        // URI típica del pooler de Supabase (con contraseña con carácter especial url-encoded).
        var uri = "postgresql://postgres.pwcggulwqgpizlbaoory:p%40ss%3Aword@aws-0-eu-west-3.pooler.supabase.com:5432/postgres";

        var cs = DependencyInjection.NormalizeConnectionString(uri);

        // Npgsql debe aceptar el resultado sin lanzar "Format ... does not conform".
        var b = new NpgsqlConnectionStringBuilder(cs);
        Assert.Equal("aws-0-eu-west-3.pooler.supabase.com", b.Host);
        Assert.Equal(5432, b.Port);
        Assert.Equal("postgres", b.Database);
        Assert.Equal("postgres.pwcggulwqgpizlbaoory", b.Username);
        Assert.Equal("p@ss:word", b.Password); // desescapado del %40 y %3A
        Assert.Equal(SslMode.Require, b.SslMode);
    }

    [Fact]
    public void KeyValueString_PassesThroughUnchanged()
    {
        var kv = "Host=h;Port=5432;Database=postgres;Username=u;Password=p;SSL Mode=Require";
        Assert.Equal(kv, DependencyInjection.NormalizeConnectionString(kv));
    }

    [Fact]
    public void SqliteString_PassesThrough()
    {
        Assert.Equal("Data Source=nomos_local.db", DependencyInjection.NormalizeConnectionString("Data Source=nomos_local.db"));
    }

    [Fact]
    public void TrimsSurroundingQuotes()
    {
        Assert.Equal("Host=h;Database=d", DependencyInjection.NormalizeConnectionString("\"Host=h;Database=d\""));
    }
}
