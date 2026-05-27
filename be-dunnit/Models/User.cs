using System.ComponentModel.DataAnnotations;

namespace be_dunnit.Models;

public class User
{
    public Guid Id { get; set; }

    [Required]
    [MaxLength(320)]
    public required string Email { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public DateTimeOffset? DeletedAt { get; set; }
}
