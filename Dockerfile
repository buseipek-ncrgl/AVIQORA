# AVIQORA Supersonic Flight Booking Platform - Dockerfile
# References infrastructure/docker/Dockerfile.api and Dockerfile.web

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["services/aviqora-api/src/Aviqora.Api/Aviqora.Api.csproj", "services/aviqora-api/src/Aviqora.Api/"]
COPY ["services/aviqora-api/src/Aviqora.Application/Aviqora.Application.csproj", "services/aviqora-api/src/Aviqora.Application/"]
COPY ["services/aviqora-api/src/Aviqora.Domain/Aviqora.Domain.csproj", "services/aviqora-api/src/Aviqora.Domain/"]
COPY ["services/aviqora-api/src/Aviqora.Infrastructure/Aviqora.Infrastructure.csproj", "services/aviqora-api/src/Aviqora.Infrastructure/"]
RUN dotnet restore "services/aviqora-api/src/Aviqora.Api/Aviqora.Api.csproj"
COPY . .
WORKDIR "/src/services/aviqora-api/src/Aviqora.Api"
RUN dotnet build "Aviqora.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Aviqora.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Aviqora.Api.dll"]
