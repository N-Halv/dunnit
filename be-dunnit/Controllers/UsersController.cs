using System.Security.Claims;
using be_dunnit.Dtos;
using be_dunnit.Services;
using Microsoft.AspNetCore.Mvc;

namespace be_dunnit.Controllers;

[ApiController]
[Route("users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserResponse>> GetMe(CancellationToken cancellationToken)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized(new { error = "JWT does not contain an email claim." });
        }

        var user = await _userService.GetOrCreateByEmailAsync(email, cancellationToken);

        return new UserResponse(
            user.Id,
            user.Email,
            user.CreatedAt,
            user.UpdatedAt);
    }
}
