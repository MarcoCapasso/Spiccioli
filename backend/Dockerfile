# Fase 1: compilazione, con l'SDK completo
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Prima solo il file di progetto, poi il ripristino dei pacchetti
COPY Spiccioli.Api/Spiccioli.Api.csproj Spiccioli.Api/
RUN dotnet restore Spiccioli.Api/Spiccioli.Api.csproj

# Poi il codice, e la pubblicazione
COPY Spiccioli.Api/ Spiccioli.Api/
RUN dotnet publish Spiccioli.Api/Spiccioli.Api.csproj -c Release -o /app --no-restore

# Fase 2: esecuzione, con il solo runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app .

# Render parla con l'app sulla porta 10000
ENV ASPNETCORE_HTTP_PORTS=10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "Spiccioli.Api.dll"]