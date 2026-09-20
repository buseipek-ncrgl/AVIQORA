using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace Aviqora.Api.Middleware;

/// <summary>
/// Tüm HTTP isteklerini dinleyen ve oluşan hataları merkezi olarak yakalayıp 
/// RFC 7807 ProblemDetails formatında istemciye (F12) güvenli şekilde dönen Middleware.
/// </summary>
public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionHandlerMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlerMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            // İsteği boru hattındaki bir sonraki elemana (Controller) aktar
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "HTTP isteği işlenirken işlenmeyen bir hata oluştu: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/problem+json";

        var (statusCode, title) = exception switch
        {
            ArgumentException => (HttpStatusCode.BadRequest, "Geçersiz Parametre"),
            InvalidOperationException => (HttpStatusCode.Conflict, "İş Mantığı İhlali"),
            KeyNotFoundException => (HttpStatusCode.NotFound, "Kaynak Bulunamadı"),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Yetkisiz Erişim"),
            _ => (HttpStatusCode.InternalServerError, "Sunucu İçi Hata")
        };

        context.Response.StatusCode = (int)statusCode;

        // F12 güvenlik kuralı: 500 hatalarında hassas stack-trace istemciye sızdırılmaz!
        string detail = statusCode == HttpStatusCode.InternalServerError && !_env.IsDevelopment()
            ? "Beklenmeyen bir sunucu hatası oluştu. Lütfen sistem yöneticisiyle iletişime geçin."
            : exception.Message;

        var problemDetails = new ProblemDetails
        {
            Status = (int)statusCode,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path,
            Type = $"https://httpstatuses.com/{(int)statusCode}"
        };

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails, jsonOptions));
    }
}
