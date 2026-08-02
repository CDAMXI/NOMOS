# PLUTO (nombre tecnico: nomos) — ASP.NET Core (.NET 10) API + web front end, backed by Supabase PostgreSQL.
# Works on any container host (Render, Railway, Fly.io, Google Cloud Run, Azure).

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore como capa cacheada: solo se rehace si cambian los .csproj. Así el build normal (cambios
# de código) reutiliza los paquetes y es más rápido y ligero en hosts con pocos recursos (Render free).
COPY Nomos.Domain/Nomos.Domain.csproj Nomos.Domain/
COPY Nomos.Application/Nomos.Application.csproj Nomos.Application/
COPY Nomos.Infrastructure/Nomos.Infrastructure.csproj Nomos.Infrastructure/
COPY Nomos.Api/Nomos.Api.csproj Nomos.Api/
RUN dotnet restore Nomos.Api/Nomos.Api.csproj

COPY . .
# UseSharedCompilation=false: sin servidor Roslyn persistente → menos memoria pico durante el build
# (evita quedarse sin RAM en el plan free de Render). El proyecto de tests no entra en esta ruta.
RUN dotnet publish Nomos.Api/Nomos.Api.csproj -c Release -o /app/publish --no-restore -p:UseSharedCompilation=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .

# Sin vigilantes de fichero sobre appsettings.json. Por defecto, WebApplication.CreateBuilder los
# carga con reloadOnChange y abre un inotify por fichero; en un host compartido ese recurso se
# agota (limite de 128 instancias por usuario) y el proceso muere ANTES de la primera linea de
# Program.cs con «Exited with status 139». En un contenedor la configuracion no cambia en
# caliente: la imagen es inmutable y cualquier cambio implica un despliegue nuevo.
#   1) reloadConfigOnChange=false  -> no se crea el vigilante (arreglo de raiz).
#   2) USE_POLLING_FILE_WATCHER    -> red de seguridad: si algo mas pidiera vigilar un fichero,
#                                     sondea en vez de usar inotify.
ENV DOTNET_hostBuilder__reloadConfigOnChange=false \
    ASPNETCORE_hostBuilder__reloadConfigOnChange=false \
    DOTNET_USE_POLLING_FILE_WATCHER=true

# Default port; hosts that inject PORT override this via Program.cs.
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Nomos.Api.dll"]
