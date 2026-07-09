# NOMOS — ASP.NET Core (.NET 10) API + web front end, backed by Supabase PostgreSQL.
# Works on any container host (Render, Railway, Fly.io, Google Cloud Run, Azure).

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish Nomos.Api/Nomos.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
# Default port; hosts that inject PORT override this via Program.cs.
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "Nomos.Api.dll"]
