namespace be_dunnit.Dtos;

public record ItemResponse(
    Guid Id,
    Guid ListId,
    string Title,
    string? Description,
    double SortOrder,
    bool Completed,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
