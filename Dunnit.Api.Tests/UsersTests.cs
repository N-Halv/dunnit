using System.Net;
using Dunnit.Api.Dtos;
using Dunnit.Api.Tests.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Dunnit.Api.Tests;

public class UsersTests : IntegrationTestBase
{
    public UsersTests(TestWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task GetMe_Auto_Seeds_User_On_First_Call()
    {
        var email = "seed@example.com";
        var client = Factory.CreateClientFor(email);

        var response = await client.GetAsync("/users/me");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var user = await response.ReadAsAsync<UserResponse>();
        Assert.Equal(email, user.Email);
        Assert.NotEqual(Guid.Empty, user.Id);

        var dbCount = await Factory.WithDbAsync(db => db.Users.CountAsync(u => u.Email == email));
        Assert.Equal(1, dbCount);
    }

    [Fact]
    public async Task GetMe_Twice_Returns_Same_User()
    {
        var email = "stable@example.com";
        var client = Factory.CreateClientFor(email);

        var first = await (await client.GetAsync("/users/me")).ReadAsAsync<UserResponse>();
        var second = await (await client.GetAsync("/users/me")).ReadAsAsync<UserResponse>();

        Assert.Equal(first.Id, second.Id);
        var dbCount = await Factory.WithDbAsync(db => db.Users.CountAsync(u => u.Email == email));
        Assert.Equal(1, dbCount);
    }

    [Fact]
    public async Task Different_Emails_Get_Different_Users()
    {
        var a = await (await Factory.CreateClientFor("a@example.com").GetAsync("/users/me"))
            .ReadAsAsync<UserResponse>();
        var b = await (await Factory.CreateClientFor("b@example.com").GetAsync("/users/me"))
            .ReadAsAsync<UserResponse>();

        Assert.NotEqual(a.Id, b.Id);
    }
}
