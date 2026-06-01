using Dunnit.Api.Models;

namespace Dunnit.Api.Dtos;

public record ItemResponse(
    Guid Id,
    Guid ListId,
    string Title,
    string? Description,
    double SortOrder,
    bool Completed,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt)
{
    public static ItemResponse From(TodoItem item) => new(
        item.Id,
        item.ListId,
        item.Title,
        item.Description,
        item.SortOrder,
        item.CompletedAt is not null,
        item.CreatedAt,
        item.UpdatedAt);
}
