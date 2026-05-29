using Microsoft.AspNetCore.Diagnostics;

namespace Dunnit.Api.Exceptions;

public class UnauthorizedExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not UnauthorizedException ex)
        {
            return false;
        }

        httpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
        await httpContext.Response.WriteAsJsonAsync(
            new { error = ex.Message },
            cancellationToken);
        return true;
    }
}
