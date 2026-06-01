using System.Net;
using System.Net.Http.Json;
using Dunnit.Api.Dtos;
using Dunnit.Api.Tests.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Dunnit.Api.Tests;

public class ItemsTests : IntegrationTestBase
{
    private const string Alice = "alice@example.com";
    private const string Bob = "bob@example.com";

    public ItemsTests(TestWebApplicationFactory factory) : base(factory) { }

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

    private static async Task<ItemResponse> CreateItemAsync(HttpClient client, Guid listId, string title, string? description = null)
    {
        var response = await client.PostAsJsonAsync(
            $"/lists/{listId}/items",
            new CreateItemRequest(title, description),
            HttpJsonExtensions.JsonOptions);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return await response.ReadAsAsync<ItemResponse>();
    }

    [Fact]
    public async Task Create_Item_And_Get_Returns_It()
    {
        var client = AliceClient();
        var list = await CreateListAsync(client, "L");

        var created = await CreateItemAsync(client, list.Id, "Buy milk", "1%");

        Assert.Equal("Buy milk", created.Title);
        Assert.Equal("1%", created.Description);
        Assert.False(created.Completed);

        var fetched = await (await client.GetAsync($"/lists/{list.Id}/items/{created.Id}"))
            .ReadAsAsync<ItemResponse>();
        Assert.Equal(created.Id, fetched.Id);
    }

    [Fact]
    public async Task GetAll_Items_Returns_In_Sort_Order()
    {
        var client = AliceClient();
        var list = await CreateListAsync(client, "L");
        var i1 = await CreateItemAsync(client, list.Id, "1");
        var i2 = await CreateItemAsync(client, list.Id, "2");
        var i3 = await CreateItemAsync(client, list.Id, "3");

        var items = await (await client.GetAsync($"/lists/{list.Id}/items"))
            .ReadAsAsync<List<ItemResponse>>();

        Assert.Equal(new[] { i1.Id, i2.Id, i3.Id }, items.Select(i => i.Id).ToArray());
    }

    [Fact]
    public async Task GetAll_For_Foreign_List_Returns_NotFound()
    {
        var aliceList = await CreateListAsync(AliceClient(), "alice");

        var response = await BobClient().GetAsync($"/lists/{aliceList.Id}/items");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetAll_For_Unknown_List_Returns_NotFound()
    {
        var response = await AliceClient().GetAsync($"/lists/{Guid.NewGuid()}/items");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Create_Item_In_Foreign_List_Returns_NotFound()
    {
        var aliceList = await CreateListAsync(AliceClient(), "alice");

        var response = await BobClient().PostAsJsonAsync(
            $"/lists/{aliceList.Id}/items",
            new CreateItemRequest("hijack", null),
            HttpJsonExtensions.JsonOptions);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var count = await Factory.WithDbAsync(db => db.Items.CountAsync(i => i.ListId == aliceList.Id));
        Assert.Equal(0, count);
    }

    [Fact]
    public async Task Get_Item_In_Foreign_List_Returns_NotFound()
    {
        var alice = AliceClient();
        var aliceList = await CreateListAsync(alice, "alice");
        var aliceItem = await CreateItemAsync(alice, aliceList.Id, "secret");

        var response = await BobClient().GetAsync($"/lists/{aliceList.Id}/items/{aliceItem.Id}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Update_Item_Marks_Completed_And_Stamps_CompletedAt()
    {
        var client = AliceClient();
        var list = await CreateListAsync(client, "L");
        var item = await CreateItemAsync(client, list.Id, "do");

        var response = await client.PatchAsJsonAsync(
            $"/lists/{list.Id}/items/{item.Id}",
            new UpdateItemRequest("do", null, true),
            HttpJsonExtensions.JsonOptions);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.ReadAsAsync<ItemResponse>();
        Assert.True(updated.Completed);

        var completedAt = await Factory.WithDbAsync(db => db.Items
            .Where(i => i.Id == item.Id)
            .Select(i => i.CompletedAt)
            .FirstAsync());
        Assert.NotNull(completedAt);
    }

    [Fact]
    public async Task Update_Item_Uncomplete_Clears_CompletedAt()
    {
        var client = AliceClient();
        var list = await CreateListAsync(client, "L");
        var item = await CreateItemAsync(client, list.Id, "do");

        // Complete it.
        await client.PatchAsJsonAsync(
            $"/lists/{list.Id}/items/{item.Id}",
            new UpdateItemRequest("do", null, true),
            HttpJsonExtensions.JsonOptions);

        // Now un-complete.
        var response = await client.PatchAsJsonAsync(
            $"/lists/{list.Id}/items/{item.Id}",
            new UpdateItemRequest("do", null, false),
            HttpJsonExtensions.JsonOptions);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.ReadAsAsync<ItemResponse>();
        Assert.False(updated.Completed);

        var completedAt = await Factory.WithDbAsync(db => db.Items
            .Where(i => i.Id == item.Id)
            .Select(i => i.CompletedAt)
            .FirstAsync());
        Assert.Null(completedAt);
    }

    [Fact]
    public async Task Update_Item_In_Foreign_List_Returns_NotFound()
    {
        var alice = AliceClient();
        var aliceList = await CreateListAsync(alice, "alice");
        var aliceItem = await CreateItemAsync(alice, aliceList.Id, "original");

        var response = await BobClient().PatchAsJsonAsync(
            $"/lists/{aliceList.Id}/items/{aliceItem.Id}",
            new UpdateItemRequest("hijacked", null, false),
            HttpJsonExtensions.JsonOptions);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var title = await Factory.WithDbAsync(db => db.Items
            .Where(i => i.Id == aliceItem.Id)
            .Select(i => i.Title)
            .FirstAsync());
        Assert.Equal("original", title);
    }

    [Fact]
    public async Task Delete_Item_SoftDeletes()
    {
        var client = AliceClient();
        var list = await CreateListAsync(client, "L");
        var item = await CreateItemAsync(client, list.Id, "x");

        var deleteResponse = await client.DeleteAsync($"/lists/{list.Id}/items/{item.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var getResponse = await client.GetAsync($"/lists/{list.Id}/items/{item.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);

        var deletedAt = await Factory.WithDbAsync(db => db.Items
            .IgnoreQueryFilters()
            .Where(i => i.Id == item.Id)
            .Select(i => i.DeletedAt)
            .FirstAsync());
        Assert.NotNull(deletedAt);
    }

    [Fact]
    public async Task Delete_Item_In_Foreign_List_Returns_NotFound()
    {
        var alice = AliceClient();
        var aliceList = await CreateListAsync(alice, "alice");
        var aliceItem = await CreateItemAsync(alice, aliceList.Id, "x");

        var response = await BobClient().DeleteAsync($"/lists/{aliceList.Id}/items/{aliceItem.Id}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Item_In_SoftDeleted_List_Is_Hidden()
    {
        var client = AliceClient();
        var list = await CreateListAsync(client, "L");
        var item = await CreateItemAsync(client, list.Id, "x");

        await client.DeleteAsync($"/lists/{list.Id}");

        var listResponse = await client.GetAsync($"/lists/{list.Id}/items");
        Assert.Equal(HttpStatusCode.NotFound, listResponse.StatusCode);

        var itemResponse = await client.GetAsync($"/lists/{list.Id}/items/{item.Id}");
        Assert.Equal(HttpStatusCode.NotFound, itemResponse.StatusCode);
    }

    [Fact]
    public async Task Reorder_Item_To_Top()
    {
        var client = AliceClient();
        var list = await CreateListAsync(client, "L");
        var a = await CreateItemAsync(client, list.Id, "a");
        var b = await CreateItemAsync(client, list.Id, "b");
        var c = await CreateItemAsync(client, list.Id, "c");

        var response = await client.PatchAsJsonAsync(
            $"/lists/{list.Id}/items/{c.Id}/position",
            new UpdateItemPositionRequest(null),
            HttpJsonExtensions.JsonOptions);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var items = await (await client.GetAsync($"/lists/{list.Id}/items"))
            .ReadAsAsync<List<ItemResponse>>();
        Assert.Equal(new[] { c.Id, a.Id, b.Id }, items.Select(i => i.Id).ToArray());
    }

    [Fact]
    public async Task Reorder_Item_Between_Places_Between()
    {
        var client = AliceClient();
        var list = await CreateListAsync(client, "L");
        var a = await CreateItemAsync(client, list.Id, "a");
        var b = await CreateItemAsync(client, list.Id, "b");
        var c = await CreateItemAsync(client, list.Id, "c");

        // Place C after A → expect a, c, b.
        var response = await client.PatchAsJsonAsync(
            $"/lists/{list.Id}/items/{c.Id}/position",
            new UpdateItemPositionRequest(a.Id),
            HttpJsonExtensions.JsonOptions);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var items = await (await client.GetAsync($"/lists/{list.Id}/items"))
            .ReadAsAsync<List<ItemResponse>>();
        Assert.Equal(new[] { a.Id, c.Id, b.Id }, items.Select(i => i.Id).ToArray());
    }

    [Fact]
    public async Task Reorder_Same_Preceding_Returns_400()
    {
        var client = AliceClient();
        var list = await CreateListAsync(client, "L");
        var item = await CreateItemAsync(client, list.Id, "x");

        var response = await client.PatchAsJsonAsync(
            $"/lists/{list.Id}/items/{item.Id}/position",
            new UpdateItemPositionRequest(item.Id),
            HttpJsonExtensions.JsonOptions);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Reorder_Preceding_In_Different_List_Returns_400()
    {
        var client = AliceClient();
        var list1 = await CreateListAsync(client, "L1");
        var list2 = await CreateListAsync(client, "L2");
        var item1 = await CreateItemAsync(client, list1.Id, "in-list1");
        var item2 = await CreateItemAsync(client, list2.Id, "in-list2");

        // Try to position list1's item after a preceding item that lives in list2 → must be rejected.
        var response = await client.PatchAsJsonAsync(
            $"/lists/{list1.Id}/items/{item1.Id}/position",
            new UpdateItemPositionRequest(item2.Id),
            HttpJsonExtensions.JsonOptions);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Reorder_Item_In_Foreign_List_Returns_NotFound()
    {
        var alice = AliceClient();
        var aliceList = await CreateListAsync(alice, "alice");
        var aliceItem = await CreateItemAsync(alice, aliceList.Id, "x");

        var response = await BobClient().PatchAsJsonAsync(
            $"/lists/{aliceList.Id}/items/{aliceItem.Id}/position",
            new UpdateItemPositionRequest(null),
            HttpJsonExtensions.JsonOptions);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Create_Item_Empty_Title_Returns_400()
    {
        var client = AliceClient();
        var list = await CreateListAsync(client, "L");

        var response = await client.PostAsJsonAsync(
            $"/lists/{list.Id}/items",
            new CreateItemRequest("", null),
            HttpJsonExtensions.JsonOptions);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_Item_TooLong_Description_Returns_400()
    {
        var client = AliceClient();
        var list = await CreateListAsync(client, "L");

        var response = await client.PostAsJsonAsync(
            $"/lists/{list.Id}/items",
            new CreateItemRequest("ok", new string('x', 2001)),
            HttpJsonExtensions.JsonOptions);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
