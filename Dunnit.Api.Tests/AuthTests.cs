using System.Net;
using System.Net.Http.Json;
using Dunnit.Api.Dtos;
using Dunnit.Api.Tests.Infrastructure;

namespace Dunnit.Api.Tests;

public class AuthTests : IntegrationTestBase
{
    public AuthTests(TestWebApplicationFactory factory) : base(factory) { }

    public static IEnumerable<object?[]> ProtectedRoutes()
    {
        yield return new object?[] { HttpMethod.Get, "/users/me", null };
        yield return new object?[] { HttpMethod.Get, "/lists", null };
        yield return new object?[] { HttpMethod.Post, "/lists", new CreateListRequest("x") };
        yield return new object?[] { HttpMethod.Get, $"/lists/{Guid.NewGuid()}", null };
        yield return new object?[] { HttpMethod.Patch, $"/lists/{Guid.NewGuid()}", new UpdateListRequest("x") };
        yield return new object?[] { HttpMethod.Patch, $"/lists/{Guid.NewGuid()}/position", new UpdateListPositionRequest(null) };
        yield return new object?[] { HttpMethod.Delete, $"/lists/{Guid.NewGuid()}", null };
        yield return new object?[] { HttpMethod.Get, $"/lists/{Guid.NewGuid()}/items", null };
        yield return new object?[] { HttpMethod.Post, $"/lists/{Guid.NewGuid()}/items", new CreateItemRequest("x", null) };
        yield return new object?[] { HttpMethod.Get, $"/lists/{Guid.NewGuid()}/items/{Guid.NewGuid()}", null };
        yield return new object?[] { HttpMethod.Patch, $"/lists/{Guid.NewGuid()}/items/{Guid.NewGuid()}", new UpdateItemRequest("x", null, false) };
        yield return new object?[] { HttpMethod.Patch, $"/lists/{Guid.NewGuid()}/items/{Guid.NewGuid()}/position", new UpdateItemPositionRequest(null) };
        yield return new object?[] { HttpMethod.Delete, $"/lists/{Guid.NewGuid()}/items/{Guid.NewGuid()}", null };
    }

    [Theory]
    [MemberData(nameof(ProtectedRoutes))]
    public async Task Anonymous_Request_Is_Rejected(HttpMethod method, string url, object? body)
    {
        var client = Factory.CreateClient();
        using var request = new HttpRequestMessage(method, url);
        if (body is not null)
        {
            request.Content = JsonContent.Create(body, options: HttpJsonExtensions.JsonOptions);
        }

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        // The 401 must come from the authorization middleware (empty body) — NOT from the
        // CurrentUser model binder throwing UnauthorizedException, which would mean the
        // request reached the action and an [AllowAnonymous] is silently exposing the route.
        var responseBody = await response.Content.ReadAsStringAsync();
        Assert.True(
            string.IsNullOrEmpty(responseBody),
            $"Expected empty body from auth pipeline, but got: {responseBody}");
    }

    [Fact]
    public async Task Auth_With_No_Email_Header_Is_Rejected()
    {
        // Header missing entirely → TestAuthHandler returns NoResult → fallback policy denies.
        var client = Factory.CreateClient();

        var response = await client.GetAsync("/lists");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Auth_With_Empty_Email_Header_Is_Rejected()
    {
        var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthHandler.EmailHeader, "");

        var response = await client.GetAsync("/lists");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Authenticated_Request_Is_Accepted()
    {
        var client = Factory.CreateClientFor("ok@example.com");

        var response = await client.GetAsync("/lists");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
