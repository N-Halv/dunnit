namespace Dunnit.Api.Dtos;

public record UpdateItemRequest(string Title, string? Description, bool Completed);
