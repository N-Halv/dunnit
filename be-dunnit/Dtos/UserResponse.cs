namespace be_dunnit.Dtos;

public record UserResponse(
    Guid Id,
    string Email,
    string? FirstName,
    string? LastName,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
