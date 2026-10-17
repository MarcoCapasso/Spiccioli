using Spiccioli.Api.Dtos;
using Spiccioli.Api.Common;

namespace Spiccioli.Api.Services;

public interface IProfileService
{
    //Il profilo dell'utente autenticato; NotFound se l'account non esiste più
    Task<Result<UserResponse>> GetAsync(Guid userId);

    //Crea le categorie scelte e chiude il setup, in un unico salvataggio;
    // Conflict se già completato, Validation se una categoria non è tra quelle proposte
    Task<Result<UserResponse>> CompleteOnboardingAsync(Guid userId, CompleteOnboardingRequest request);
}