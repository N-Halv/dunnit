namespace be_dunnit.Dtos;

public record ListResponse(
    Guid Id,
    Guid CreatorUserId,
    string Name,
    double SortOrder,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
