using Dunnit.Api.Models;

namespace Dunnit.Api.Dtos;

public record ListResponse(
    Guid Id,
    Guid CreatorUserId,
    string Name,
    double SortOrder,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt)
{
    public static ListResponse From(TodoList list) => new(
        list.Id,
        list.CreatorUserId,
        list.Name,
        list.SortOrder,
        list.CreatedAt,
        list.UpdatedAt);
}
