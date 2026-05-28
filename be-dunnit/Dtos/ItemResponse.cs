namespace be_dunnit.Dtos;

public record ItemResponse(
    Guid Id,
    Guid ListId,
    string Title,
    string? Description,
    double SortOrder,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
