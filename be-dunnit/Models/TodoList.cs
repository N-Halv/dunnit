using System.ComponentModel.DataAnnotations;

namespace be_dunnit.Models;

public class TodoList : ITimestamped
{
    public Guid Id { get; set; }

    public Guid CreatorUserId { get; set; }

    [Required]
    [MaxLength(200)]
    public required string Name { get; set; }

    public double SortOrder { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public DateTimeOffset? DeletedAt { get; set; }

    public User Creator { get; set; } = null!;
}
