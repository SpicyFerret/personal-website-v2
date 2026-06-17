using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PersonalWebsite.Api.Data;
using PersonalWebsite.Api.Services;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// --- Configuration objects ---
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.Configure<R2Options>(builder.Configuration.GetSection(R2Options.SectionName));

// --- Database ---
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));

// --- Services ---
builder.Services.AddScoped<TokenService>();
builder.Services.AddSingleton<R2StorageService>();

// --- AuthN / AuthZ ---
var jwt = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
        };
    });
builder.Services.AddAuthorization();

// No CORS: the frontend reaches the API same-origin via the /api path
// (Cloudflare/Nitro proxy in prod, Vite/Caddy proxy locally).

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// --- Migrate + seed on startup ---
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DbSeeder.SeedAsync(db, app.Configuration);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(); // interactive docs at /scalar/v1
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
