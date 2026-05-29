namespace Dunnit.Api.Dtos;

public record UserResponse(
    Guid Id,
    string Email,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
