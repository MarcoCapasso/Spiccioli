using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Repositories;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Services;

public class ProfileService : IProfileService
{
    private readonly IUserRepository _users;
    private readonly ICategoryRepository _categories;
    public ProfileService(IUserRepository users, ICategoryRepository categories)
    {
        _users = users;
        _categories = categories;
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

    //Crea le categorie scelte e chiude il setup, tutto in un unico salvataggio
    public async Task<Result<UserResponse>> CompleteOnboardingAsync(Guid userId, CompleteOnboardingRequest request)
    {
        var user = await _users.GetByIdAsync(userId);
        if (user is null)
        {
            return Result<UserResponse>.Failure(Error.NotFound("Utente non trovato."));
        }

        if (user.HasCompletedOnboarding)
        {
            return Result<UserResponse>.Failure(Error.Conflict("Il setup iniziale è già stato completato."));
        }

        //Solo categorie dell'elenco previsto: il client non può inventarne di nuove
        var requested = request.CategoryNames.Distinct().ToList();
        var chosen = DefaultCategories.All.Where(d => requested.Contains(d.Name)).ToList();
        if (chosen.Count != requested.Count)
        {
            return Result<UserResponse>.Failure(Error.Validation(
                nameof(request.CategoryNames), "Una o più categorie scelte non sono tra quelle proposte."));
        }

        //Quelle che l'utente possiede già (archiviate comprese, senza maiuscole) non vengono ricreate
        var existing = await _categories.GetByUserAsync(userId, includeArchived: true);
        var existingNames = existing.Select(c => c.Name.ToLowerInvariant()).ToHashSet();

        var toCreate = chosen
            .Where(d => !existingNames.Contains(d.Name.ToLowerInvariant()))
            .Select((d, index) => new Category { 
                Name = d.Name, 
                Type = d.Type, 
                UserId = userId, 
                Color = CategoryPalette.Colors[(existing.Count() + index) % CategoryPalette.Colors.Count] 
                });

        _categories.AddRange(toCreate);
        user.HasCompletedOnboarding = true;

        //Un solo salvataggio, quindi una sola transazione: categorie e profilo insieme
        await _users.SaveChangesAsync();

        return Result<UserResponse>.Success(UserResponse.FromUser(user));
    }
}