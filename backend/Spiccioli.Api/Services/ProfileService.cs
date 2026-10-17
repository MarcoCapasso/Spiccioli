using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Services;

public class ProfileService : IProfileService
{
    private readonly IUserRepository _users;
    public ProfileService(IUserRepository users)
    {
        _users = users;
    }
    public async Task<Result<UserResponse>> GetAsync(Guid userId)
    {
        var user = await _users.GetByIdAsync(userId);

        if (user is null)
        {
            return Result<UserResponse>.Failure(Error.NotFound("Utente non trovato."));
        }
        
        return Result<UserResponse>.Success(UserResponse.FromUser(user));
    }
}