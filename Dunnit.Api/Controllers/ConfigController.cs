using Dunnit.Api.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dunnit.Api.Controllers;

[ApiController]
[Route("config")]
[AllowAnonymous]
public class ConfigController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public ConfigController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet]
    public ConfigResponse Get() => new ConfigResponse(
        _configuration["TestValue"],
        _configuration["Env"],
        new Auth0Config(
            _configuration["Auth0:Domain"] ?? string.Empty,
            _configuration["Auth0:ClientId"] ?? string.Empty,
            _configuration["Auth0:Audience"] ?? string.Empty));
}
