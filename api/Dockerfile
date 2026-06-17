# syntax=docker/dockerfile:1

# ---- Build (runs natively on the builder arch, cross-publishes to $TARGETARCH) ----
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG TARGETARCH
WORKDIR /src

# Restore (cached) — copy csproj first
COPY src/PersonalWebsite.Api/PersonalWebsite.Api.csproj src/PersonalWebsite.Api/
RUN dotnet restore src/PersonalWebsite.Api/PersonalWebsite.Api.csproj -a $TARGETARCH

# Publish
COPY . .
RUN dotnet publish src/PersonalWebsite.Api/PersonalWebsite.Api.csproj \
    -c Release -a $TARGETARCH --no-restore \
    -o /app/publish /p:UseAppHost=false

# ---- Runtime (final image is pulled for the target platform automatically) ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
COPY --from=build /app/publish .
# Run as the non-root user baked into the .NET images
USER $APP_UID
ENTRYPOINT ["dotnet", "PersonalWebsite.Api.dll"]
