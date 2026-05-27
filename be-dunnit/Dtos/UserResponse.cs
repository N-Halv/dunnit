namespace be_dunnit.Dtos;

public record UserResponse(
    Guid Id,
    string Email,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
