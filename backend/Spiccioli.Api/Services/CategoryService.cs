using Spiccioli.Api.Dtos;
using Spiccioli.Api.Common;
using Spiccioli.Api.Models;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;
    public CategoryService(ICategoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<CategoryResponse>> GetByUserAsync(Guid userId, bool includeArchived)
    {
        var categories = await _repository.GetByUserAsync(userId, includeArchived);
        return categories.Select(c => ToResponse(c)).ToList();
    }

    public async Task<CategoryResponse?> GetByIdAsync(Guid userId, int id)
    {
        var category = await _repository.GetByIdAsync(id, userId);
        return category is null ? null : ToResponse(category);
    }

    public async Task<Result<CategoryResponse>> CreateAsync(Guid userId, CreateCategoryRequest request) 
    {
        // Prima si pulisce il nome, poi lo si confronta: "  Cibo " e "Cibo" sono lo stesso nome
        var name = request.Name.Trim();

        var nameError = await CheckNameAvailableAsync(userId, name);
        if (nameError is not null)
        {
            return Result<CategoryResponse>.Failure(nameError);
        }

        var color = request.Color?.ToUpperInvariant() ?? await NextColorAsync(userId);

        var category = new Category
        {
            Name = name,
            Type = request.Type,
            Color = color,
            UserId = userId,
        };

        await _repository.AddAsync(category);

        return Result<CategoryResponse>.Success(ToResponse(category));
    }

    public async Task<Result<CategoryResponse>> RenameAsync(Guid userId, int id, UpdateCategoryRequest request)
    {
        var category = await _repository.GetByIdAsync(id, userId);
        if (category is null)
        {
            return Result<CategoryResponse>.Failure(Error.NotFound("Categoria non trovata"));
        }

        var name = request.Name.Trim();

        var nameError = await CheckNameAvailableAsync(userId, name, excludedCategoryId: id);
        if (nameError is not null)
        {
            return Result<CategoryResponse>.Failure(nameError);
        }

        category.Name = name;

        if (request.Color is not null)
        {
            category.Color = request.Color.ToUpperInvariant();
        }

        await _repository.SaveChangesAsync();

        return Result<CategoryResponse>.Success(ToResponse(category));
    }

    public async Task<bool> DeleteAsync(Guid userId, int id)
    {
        var category = await _repository.GetByIdAsync(id, userId);
        if (category is null)
        {
            return false;
        }

        if (await _repository.IsInUseAsync(category.Id))
        {
            //Ha transazioni nella storia, si archivia
            category.IsArchived = true;
            await _repository.SaveChangesAsync();
        }
        else
        {   
            //Nessuna storia, si elimina davvero
            await _repository.DeleteAsync(category);
        }

        return true;
    }

    public async Task<CategoryResponse?> RestoreAsync(Guid userId, int id)
    {
        var category = await _repository.GetByIdAsync(id, userId);
        if (category is null)
        {
            return null;
        }

        category.IsArchived = false;

        await _repository.SaveChangesAsync();

        return ToResponse(category);
    }

    private static CategoryResponse ToResponse(Category category)
    {
        return new CategoryResponse(
            category.Id,
            category.Name,
            category.Type,
            category.IsArchived,
            category.Color
        );
    }

    //Il nome deve essere libero tra le categorie dell'utente, archiviate comprese, senza maiuscole.
    private async Task<Error?> CheckNameAvailableAsync(Guid userId, string name, int? excludedCategoryId = null)
    {
        var existing = await _repository.FindByNameAsync(userId, name);

        if (existing is null || existing.Id == excludedCategoryId)
        {
            return null;
        }

        return existing.IsArchived
            ? Error.Conflict($"Esiste già una categoria archiviata chiamata \"{existing.Name}\": puoi ripristinarla.")
            : Error.Conflict($"Esiste già una categoria chiamata \"{existing.Name}\".");
    }

    //Senza una scelta dell'utente, il prossimo colore della tavolozza, a rotazione
    private async Task<string> NextColorAsync(Guid userId)
    {
        var count = (await _repository.GetByUserAsync(userId, true)).Count();
        return CategoryPalette.Colors[count % CategoryPalette.Colors.Count];
    }
}