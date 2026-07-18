# NOMOS — ASP.NET Core (.NET 10) API + web front end, backed by Supabase PostgreSQL.
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
# Default port; hosts that inject PORT override this via Program.cs.
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Nomos.Api.dll"]
