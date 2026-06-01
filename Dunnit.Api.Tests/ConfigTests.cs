using System.Net;
using Dunnit.Api.Dtos;
using Dunnit.Api.Tests.Infrastructure;

namespace Dunnit.Api.Tests;

public class ConfigTests : IntegrationTestBase
{
    public ConfigTests(TestWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task Get_Config_Allows_Anonymous()
    {
        var client = Factory.CreateClient();

        var response = await client.GetAsync("/config");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.ReadAsAsync<ConfigResponse>();
        Assert.NotNull(body.Auth0);
    }

    [Fact]
    public async Task Get_Config_Works_With_Auth_Too()
    {
        var client = Factory.CreateClientFor("anyone@example.com");

        var response = await client.GetAsync("/config");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
