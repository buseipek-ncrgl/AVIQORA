using System.Text;
using Aviqora.Api.Middleware;
using Aviqora.Application;
using Aviqora.Infrastructure;
using Aviqora.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// 1. Application & Infrastructure servislerini IoC Container'a ekle
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// 2. Controller ve OpenAPI (Swagger) servislerini IoC Container'a kaydet
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// 3. JWT Authentication & Bearer Token Doğrulama Ayarları
var secretKey = builder.Configuration["Jwt:SecretKey"] 
    ?? "AVIQORA_SUPER_SECRET_SECURITY_KEY_FOR_JWT_SIGNING_2026_VERY_SECURE!";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "AviqoraApi",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "AviqoraClient",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };
    });

builder.Services.AddAuthorization();

// 4. CORS Politikası: Next.js Frontend (http://localhost:3000) erişimine izin ver
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJsClient", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// 5. HTTP Request Pipeline Yapılandırması (Sıralama AŞIRI KRİTİKTİR!)

// A. En tepede Global Exception Handler
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    // Veritabanını otomatik tohumla (Seeder)
    await DataSeeder.SeedAsync(app.Services);
}

app.UseHttpsRedirection();

// B. CORS Politikası
app.UseCors("AllowNextJsClient");

// C. Kimlik Doğrulama (AuthN) -> Yetkilendirme (AuthZ) Sıralaması Hayatidir!
app.UseAuthentication();
app.UseAuthorization();

// D. Controller Endpoint'lerini Maple
app.MapControllers();

app.Run();

// Integration testlerinde WebApplicationFactory ile referans verebilmek için partial class tanımı
public partial class Program { }
