using System.ComponentModel.DataAnnotations;

namespace Dunnit.Api.Models;

public class TodoItem : ITimestamped
{
    public Guid Id { get; set; }

    public Guid ListId { get; set; }

    [Required]
    [MaxLength(200)]
    public required string Title { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    public double SortOrder { get; set; }

    public DateTimeOffset? CompletedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public DateTimeOffset? DeletedAt { get; set; }

    public TodoList List { get; set; } = null!;
}
