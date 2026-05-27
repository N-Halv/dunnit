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

        var firstName = User.FindFirstValue(ClaimTypes.GivenName);
        var lastName = User.FindFirstValue(ClaimTypes.Surname);

        var user = await _userService.GetOrCreateByEmailAsync(email, firstName, lastName, cancellationToken);

        return new UserResponse(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.CreatedAt,
            user.UpdatedAt);
    }
}
