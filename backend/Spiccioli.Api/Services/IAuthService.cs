using Spiccioli.Api.Dtos;
using Spiccioli.Api.Common;

namespace Spiccioli.Api.Services;

public interface IAuthService
{
    //Registra un nuovo utente, restituisce Conflict se l'email è già registrata
    Task<Result<UserResponse>> RegisterAsync(RegisterRequest request);

    //Verifica le credenziali e restituisce un token, Unauthorized se non sono valide
    Task<Result<AuthResponse>> LoginAsync(LoginRequest request);
}