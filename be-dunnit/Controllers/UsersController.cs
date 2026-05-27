using be_dunnit.Dtos;
using be_dunnit.ModelBinding;
using be_dunnit.Models;
using Microsoft.AspNetCore.Mvc;

namespace be_dunnit.Controllers;

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
