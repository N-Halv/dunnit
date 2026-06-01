using Dunnit.Api.Models;

namespace Dunnit.Api.Dtos;

public record UserResponse(
    Guid Id,
    string Email,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt)
{
    public static UserResponse From(User user) => new(
        user.Id,
        user.Email,
        user.CreatedAt,
        user.UpdatedAt);
}
