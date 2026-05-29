using System.ComponentModel.DataAnnotations;

namespace Dunnit.Api.Models;

public class User : ITimestamped
{
    public Guid Id { get; set; }

    [Required]
    [MaxLength(320)]
    public required string Email { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public DateTimeOffset? DeletedAt { get; set; }
}
