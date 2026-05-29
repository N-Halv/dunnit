using Dunnit.Api.Dtos;
using Dunnit.Api.ModelBinding;
using Dunnit.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace Dunnit.Api.Controllers;

[ApiController]
[Route("users")]
public class UsersController : ControllerBase
{
    [HttpGet("me")]
    public ActionResult<UserResponse> GetMe([CurrentUser] User user)
    {
        return new UserResponse(
            user.Id,
            user.Email,
            user.CreatedAt,
            user.UpdatedAt);
    }
}
