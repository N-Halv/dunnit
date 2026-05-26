using be_dunnit.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace be_dunnit.Controllers;

[ApiController]
[Route("config")]
public class ConfigController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public ConfigController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet]
    public ConfigResponse Get() => new(
        _configuration["TestValue"],
        _configuration["Env"]);
}
