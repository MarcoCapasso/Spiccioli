namespace Spiccioli.Api.Dtos;

public record UserResponse(
    Guid Id,
    string FirstName,
    string? LastName,
    string Email,
    bool HasCompletedOnboarding);

