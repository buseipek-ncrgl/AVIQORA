using Aviqora.Api.Middleware;
using Aviqora.Application;
using Aviqora.Infrastructure;
using Aviqora.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// 1. Application & Infrastructure servislerini IoC Container'a ekle
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// 2. Controller ve OpenAPI (Swagger) servislerini IoC Container'a kaydet
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// 2. CORS (Cross-Origin Resource Sharing) Politikası: Next.js Frontend (http://localhost:3000) erişimine izin ver
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

// 3. HTTP Request Pipeline Yapılandırması (Sıralama AŞIRI KRİTİKTİR!)

// A. En tepede Global Exception Handler: Tüm boru hattında oluşacak hataları ilk sırada yakalar!
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

app.UseAuthorization();

// C. Controller Endpoint'lerini Maple
app.MapControllers();

app.Run();

// Integration testlerinde WebApplicationFactory ile referans verebilmek için partial class tanımı
public partial class Program { }
