namespace Dunnit.Api.Dtos;

public record ConfigResponse(string? TestValue, string? Env, Auth0Config Auth0);

public record Auth0Config(string Domain, string ClientId, string Audience);
