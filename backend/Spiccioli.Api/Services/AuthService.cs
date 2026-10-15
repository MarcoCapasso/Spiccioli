using Microsoft.AspNetCore.Identity;
using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Models;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher<User> _passwordHasher;

    //L'hasher arriva dalla DI tramite interfaccia
    public AuthService(IUserRepository users, IPasswordHasher<User> passwordHasher)
    {
        _users = users;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<UserResponse>> RegisterAsync(RegisterRequest request)
    {
        //L'email è un identificativo, si normalizza prima di cercarla e di salvarla
        var email = request.Email.Trim().ToLowerInvariant();

        if (await _users.GetByEmailAsync(email) is not null)
        {
            return Result<UserResponse>.Failure(Error.Conflict("Esiste già un account con questa email."));
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName?.Trim(),
            Email = email,
        };

        // Si salva solo l'hash: la password in chiaro non lascia mai questo metodo
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        await _users.AddAsync(user);

        return Result<UserResponse>.Success(ToResponse(user));
    }

    //Conversione modello → DTO
    private static UserResponse ToResponse(User user)
    {
        return new UserResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            user.HasCompletedOnboarding);
    }
}