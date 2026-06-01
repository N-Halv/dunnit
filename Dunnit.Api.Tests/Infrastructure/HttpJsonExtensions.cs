using System.Net.Http.Json;
using System.Text.Json;

namespace Dunnit.Api.Tests.Infrastructure;

public static class HttpJsonExtensions
{
    public static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public static async Task<T> ReadAsAsync<T>(this HttpResponseMessage response)
    {
        var value = await response.Content.ReadFromJsonAsync<T>(JsonOptions);
        Assert.NotNull(value);
        return value!;
    }
}
