using Microsoft.AspNetCore.Identity;
using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Models;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Services;

//Registrazione e login: l'unico punto in cui una password in chiaro viene toccata
public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly ITokenService _tokens;

    //Unico errore per email inesistente e password sbagliata
    private static readonly Error InvalidCredentials = Error.Unauthorized("Credenziali non valide.");

    //Hash fittizio, calcolato una volta: con un'email inesistente si esegue comunque una verifica,
    // così i due casi impiegano lo stesso tempo e non si distinguono nemmeno misurando le risposte
    private static readonly string DummyHash = new PasswordHasher<User>().HashPassword(new User(), "password-fittizia");

    //L'hasher arriva dalla DI tramite interfaccia: nei test si potrà sostituire con un finto veloce
    public AuthService(IUserRepository users, IPasswordHasher<User> passwordHasher, ITokenService tokens)
    {
        _users = users;
        _passwordHasher = passwordHasher;
        _tokens = tokens;
    }

    public async Task<Result<UserResponse>> RegisterAsync(RegisterRequest request)
    {
        var email = NormalizeEmail(request.Email);

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

        //Si salva solo l'hash la password in chiaro non lascia mai questo metodo
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        await _users.AddAsync(user);

        return Result<UserResponse>.Success(UserResponse.FromUser(user));
    }

    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var email = NormalizeEmail(request.Email);
        var user = await _users.GetByEmailAsync(email);

        if (user is null)
        {
            //Il risultato non conta serve solo a spendere lo stesso tempo di una verifica vera
            _passwordHasher.VerifyHashedPassword(new User(), DummyHash, request.Password);
            return Result<AuthResponse>.Failure(InvalidCredentials);
        }

        var verification = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verification == PasswordVerificationResult.Failed)
        {
            return Result<AuthResponse>.Failure(InvalidCredentials);
        }

        var token = _tokens.CreateToken(user);
        return Result<AuthResponse>.Success(new AuthResponse(token, UserResponse.FromUser(user)));
    }

    //L'email è un identificativo un'unica regola per registrazione e login,
    // se divergessero alcuni utenti non potrebbero più accedere
    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}