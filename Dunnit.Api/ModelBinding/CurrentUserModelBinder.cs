using System.Security.Claims;
using Dunnit.Api.Exceptions;
using Dunnit.Api.Services;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Dunnit.Api.ModelBinding;

public class CurrentUserModelBinder : IModelBinder
{
    public async Task BindModelAsync(ModelBindingContext bindingContext)
    {
        ArgumentNullException.ThrowIfNull(bindingContext);

        var http = bindingContext.HttpContext;
        var email = http.User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new UnauthorizedException("JWT does not contain an email claim.");
        }

        var userService = http.RequestServices.GetRequiredService<IUserService>();
        var user = await userService.GetOrCreateByEmailAsync(email, http.RequestAborted);
        bindingContext.Result = ModelBindingResult.Success(user);
    }
}
