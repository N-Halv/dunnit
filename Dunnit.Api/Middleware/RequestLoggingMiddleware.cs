using System.Security.Claims;
using System.Text;

namespace Dunnit.Api.Middleware;

public partial class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var request = context.Request;
        var method = request.Method;
        var path = request.Path.Value ?? string.Empty;
        var queryString = request.QueryString.Value ?? string.Empty;
        var user = context.User.FindFirstValue(ClaimTypes.Email) ?? "anonymous";

        if (_logger.IsEnabled(LogLevel.Information))
        {
            var body = await ReadRequestBodyAsync(request);
            LogRequest(_logger, method, path, queryString, user, body);
        }

        try
        {
            await _next(context);

            var statusCode = context.Response.StatusCode;
            LogResponse(_logger, method, path, statusCode, user);
        }
        catch (Exception ex)
        {
            LogError(_logger, ex, method, path, user);
            throw;
        }
    }

    private static async Task<string> ReadRequestBodyAsync(HttpRequest request)
    {
        if (request.ContentLength is null or 0)
        {
            return string.Empty;
        }

        // Without buffering, the body stream is forward-only and the controller
        // wouldn't be able to re-read it after we do.
        request.EnableBuffering();

        using var reader = new StreamReader(
            request.Body,
            encoding: Encoding.UTF8,
            detectEncodingFromByteOrderMarks: false,
            leaveOpen: true);
        var body = await reader.ReadToEndAsync();
        request.Body.Position = 0;
        return body;
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "HTTP {Method} {Path}{QueryString} | user={User} | body={Body}")]
    private static partial void LogRequest(ILogger logger, string method, string path, string queryString, string user, string body);

    [LoggerMessage(Level = LogLevel.Information, Message = "HTTP {Method} {Path} responded {StatusCode} | user={User}")]
    private static partial void LogResponse(ILogger logger, string method, string path, int statusCode, string user);

    [LoggerMessage(Level = LogLevel.Error, Message = "HTTP {Method} {Path} failed | user={User}")]
    private static partial void LogError(ILogger logger, Exception ex, string method, string path, string user);
}
