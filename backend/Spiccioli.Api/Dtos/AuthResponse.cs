namespace Spiccioli.Api.Dtos;

public record AuthResponse(
    string AccessToken,
    UserResponse User
);