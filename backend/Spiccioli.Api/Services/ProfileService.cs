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

        //Ogni categoria proposta ha un colore fisso, dalla sua posizione nell'elenco
        var toCreate = DefaultCategories.All
            .Select((d, position) => (Default: d, Color: CategoryPalette.Colors[position % CategoryPalette.Colors.Count]))
            .Where(x => requested.Contains(x.Default.Name) && !existingNames.Contains(x.Default.Name.ToLowerInvariant()))
            .Select(x => new Category { Name = x.Default.Name, Type = x.Default.Type, UserId = userId, Color = x.Color });

        _categories.AddRange(toCreate);
        user.HasCompletedOnboarding = true;

        //Un solo salvataggio, quindi una sola transazione: categorie e profilo insieme
        await _users.SaveChangesAsync();

        return Result<UserResponse>.Success(UserResponse.FromUser(user));
    }

    //Cambia il nome mostrato nell'app, senza toccare i dati di Google
    public async Task<Result<UserResponse>> UpdateAsync(Guid userId, UpdateProfileRequest request)
    {
        var user = await _users.GetByIdAsync(userId);
        if (user is null)
        {
            return Result<UserResponse>.Failure(Error.NotFound("Utente non trovato."));
        }

        //Il controllo dell'attributo non basta: gli spazi ai bordi si tolgono, e può restare un nome vuoto
        var name = request.FirstName.Trim();
        if (name.Length == 0)
        {
            return Result<UserResponse>.Failure(Error.Validation(
                nameof(request.FirstName), "Il nome non può essere vuoto."));
        }

        user.FirstName = name;
        await _users.SaveChangesAsync();

        return Result<UserResponse>.Success(UserResponse.FromUser(user));
    }
}