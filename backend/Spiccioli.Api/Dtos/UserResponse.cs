using Spiccioli.Api.Models;

namespace Spiccioli.Api.Dtos;

public record UserResponse(
    Guid Id,
    string FirstName,
    string? LastName,
    string Email,
    bool HasCompletedOnboarding)
{
    public static UserResponse FromUser(User user) =>
        new(user.Id, user.FirstName, user.LastName, user.Email, user.HasCompletedOnboarding);   
}

