using System.Net;
using System.Net.Http.Json;
using Dunnit.Api.Dtos;
using Dunnit.Api.Tests.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Dunnit.Api.Tests;

public class ListsTests : IntegrationTestBase
{
    private const string Alice = "alice@example.com";
    private const string Bob = "bob@example.com";

    public ListsTests(TestWebApplicationFactory factory) : base(factory) { }

    private HttpClient AliceClient() => Factory.CreateClientFor(Alice);
    private HttpClient BobClient() => Factory.CreateClientFor(Bob);

    private static async Task<ListResponse> CreateListAsync(HttpClient client, string name)
    {
        var response = await client.PostAsJsonAsync(
            "/lists",
            new CreateListRequest(name),
            HttpJsonExtensions.JsonOptions);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return await response.ReadAsAsync<ListResponse>();
    }

    [Fact]
    public async Task Create_Then_Get_Returns_Created_List()
    {
        var client = AliceClient();

        var created = await CreateListAsync(client, "Groceries");

        Assert.Equal("Groceries", created.Name);
        Assert.NotEqual(Guid.Empty, created.Id);

        var fetched = await (await client.GetAsync($"/lists/{created.Id}")).ReadAsAsync<ListResponse>();
        Assert.Equal(created.Id, fetched.Id);
        Assert.Equal("Groceries", fetched.Name);
    }

    [Fact]
    public async Task GetAll_Returns_Lists_In_Sort_Order()
    {
        var client = AliceClient();
        var a = await CreateListAsync(client, "A");
        var b = await CreateListAsync(client, "B");
        var c = await CreateListAsync(client, "C");

        var lists = await (await client.GetAsync("/lists")).ReadAsAsync<List<ListResponse>>();

        Assert.Equal(new[] { a.Id, b.Id, c.Id }, lists.Select(l => l.Id).ToArray());
        Assert.True(lists[0].SortOrder < lists[1].SortOrder);
        Assert.True(lists[1].SortOrder < lists[2].SortOrder);
    }

    [Fact]
    public async Task Lists_Are_Isolated_Between_Users()
    {
        var aliceList = await CreateListAsync(AliceClient(), "alice-list");
        await CreateListAsync(BobClient(), "bob-list");

        var bobLists = await (await BobClient().GetAsync("/lists")).ReadAsAsync<List<ListResponse>>();
        Assert.Single(bobLists);
        Assert.Equal("bob-list", bobLists[0].Name);

        // Bob cannot see Alice's list by id
        var bobReadAlice = await BobClient().GetAsync($"/lists/{aliceList.Id}");
        Assert.Equal(HttpStatusCode.NotFound, bobReadAlice.StatusCode);
    }

    [Fact]
    public async Task Update_Changes_Name()
    {
        var client = AliceClient();
        var list = await CreateListAsync(client, "old");

        var response = await client.PatchAsJsonAsync(
            $"/lists/{list.Id}",
            new UpdateListRequest("new"),
            HttpJsonExtensions.JsonOptions);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.ReadAsAsync<ListResponse>();
        Assert.Equal("new", updated.Name);
    }

    [Fact]
    public async Task Update_Of_Foreign_List_Returns_NotFound()
    {
        var aliceList = await CreateListAsync(AliceClient(), "alice");

        var response = await BobClient().PatchAsJsonAsync(
            $"/lists/{aliceList.Id}",
            new UpdateListRequest("hijacked"),
            HttpJsonExtensions.JsonOptions);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var actualName = await Factory.WithDbAsync(db =>
            db.Lists.Where(l => l.Id == aliceList.Id).Select(l => l.Name).FirstAsync());
        Assert.Equal("alice", actualName);
    }

    [Fact]
    public async Task Delete_SoftDeletes_And_Hides_From_Subsequent_Reads()
    {
        var client = AliceClient();
        var list = await CreateListAsync(client, "to-delete");

        var deleteResponse = await client.DeleteAsync($"/lists/{list.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var getResponse = await client.GetAsync($"/lists/{list.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);

        // Row still exists in DB with DeletedAt populated.
        var deletedAt = await Factory.WithDbAsync(db => db.Lists
            .IgnoreQueryFilters()
            .Where(l => l.Id == list.Id)
            .Select(l => l.DeletedAt)
            .FirstAsync());
        Assert.NotNull(deletedAt);
    }

    [Fact]
    public async Task Delete_Of_Foreign_List_Returns_NotFound()
    {
        var aliceList = await CreateListAsync(AliceClient(), "alice");

        var response = await BobClient().DeleteAsync($"/lists/{aliceList.Id}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var stillExists = await Factory.WithDbAsync(db => db.Lists.AnyAsync(l => l.Id == aliceList.Id));
        Assert.True(stillExists);
    }

    [Fact]
    public async Task Reorder_To_Top_Places_List_First()
    {
        var client = AliceClient();
        var a = await CreateListAsync(client, "A");
        var b = await CreateListAsync(client, "B");
        var c = await CreateListAsync(client, "C");

        var response = await client.PatchAsJsonAsync(
            $"/lists/{c.Id}/position",
            new UpdateListPositionRequest(null),
            HttpJsonExtensions.JsonOptions);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var lists = await (await client.GetAsync("/lists")).ReadAsAsync<List<ListResponse>>();
        Assert.Equal(new[] { c.Id, a.Id, b.Id }, lists.Select(l => l.Id).ToArray());
    }

    [Fact]
    public async Task Reorder_Between_Two_Lists_Places_Between()
    {
        var client = AliceClient();
        var a = await CreateListAsync(client, "A");
        var b = await CreateListAsync(client, "B");
        var c = await CreateListAsync(client, "C");

        // Place C right after A → expect order A, C, B.
        var response = await client.PatchAsJsonAsync(
            $"/lists/{c.Id}/position",
            new UpdateListPositionRequest(a.Id),
            HttpJsonExtensions.JsonOptions);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var lists = await (await client.GetAsync("/lists")).ReadAsAsync<List<ListResponse>>();
        Assert.Equal(new[] { a.Id, c.Id, b.Id }, lists.Select(l => l.Id).ToArray());
    }

    [Fact]
    public async Task Reorder_Same_Preceding_Returns_400()
    {
        var client = AliceClient();
        var list = await CreateListAsync(client, "x");

        var response = await client.PatchAsJsonAsync(
            $"/lists/{list.Id}/position",
            new UpdateListPositionRequest(list.Id),
            HttpJsonExtensions.JsonOptions);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Reorder_Unknown_Preceding_Returns_400()
    {
        var client = AliceClient();
        var list = await CreateListAsync(client, "x");

        var response = await client.PatchAsJsonAsync(
            $"/lists/{list.Id}/position",
            new UpdateListPositionRequest(Guid.NewGuid()),
            HttpJsonExtensions.JsonOptions);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Reorder_Preceding_Owned_By_Other_User_Returns_400()
    {
        var aliceList = await CreateListAsync(AliceClient(), "alice");
        var bobList = await CreateListAsync(BobClient(), "bob");

        // Bob tries to position his list after Alice's list (which he can't see).
        var response = await BobClient().PatchAsJsonAsync(
            $"/lists/{bobList.Id}/position",
            new UpdateListPositionRequest(aliceList.Id),
            HttpJsonExtensions.JsonOptions);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Reorder_Of_Foreign_List_Returns_NotFound()
    {
        var aliceList = await CreateListAsync(AliceClient(), "alice");

        var response = await BobClient().PatchAsJsonAsync(
            $"/lists/{aliceList.Id}/position",
            new UpdateListPositionRequest(null),
            HttpJsonExtensions.JsonOptions);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Create_With_Empty_Name_Returns_400()
    {
        var client = AliceClient();

        var response = await client.PostAsJsonAsync(
            "/lists",
            new CreateListRequest(""),
            HttpJsonExtensions.JsonOptions);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_With_Too_Long_Name_Returns_400()
    {
        var client = AliceClient();

        var response = await client.PostAsJsonAsync(
            "/lists",
            new CreateListRequest(new string('a', 201)),
            HttpJsonExtensions.JsonOptions);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Update_With_Empty_Name_Returns_400()
    {
        var client = AliceClient();
        var list = await CreateListAsync(client, "ok");

        var response = await client.PatchAsJsonAsync(
            $"/lists/{list.Id}",
            new UpdateListRequest(""),
            HttpJsonExtensions.JsonOptions);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Update_With_Too_Long_Name_Returns_400()
    {
        var client = AliceClient();
        var list = await CreateListAsync(client, "ok");

        var response = await client.PatchAsJsonAsync(
            $"/lists/{list.Id}",
            new UpdateListRequest(new string('a', 201)),
            HttpJsonExtensions.JsonOptions);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
