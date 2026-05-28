namespace be_dunnit.Models;

public interface ITimestamped
{
    DateTimeOffset CreatedAt { get; set; }
    DateTimeOffset UpdatedAt { get; set; }
}
