using Spiccioli.Api.Dtos;
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

    public async Task<CategoryResponse> CreateAsync(Guid userId, CreateCategoryRequest request)
    {
        var category = new Category
        {
            Name = request.Name.Trim(),
            Type = request.Type,
            UserId = userId,
        };

        await _repository.AddAsync(category);

        return ToResponse(category);
    }

    public async Task<CategoryResponse?> RenameAsync(Guid userId, int id, UpdateCategoryRequest request)
    {
        var category = await _repository.GetByIdAsync(id, userId);
        if (category is null)
        {
            return null;
        }

        category.Name = request.Name.Trim();

        await _repository.SaveChangesAsync();

        return ToResponse(category);
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
            category.IsArchived
        );
    }
}