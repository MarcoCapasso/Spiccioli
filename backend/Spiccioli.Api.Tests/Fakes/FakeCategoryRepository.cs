using Spiccioli.Api.Models;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Tests.Fakes;

//Repository finto in memoria
public class FakeCategoryRepository : ICategoryRepository
{
    //finto database popolato dai vari test 
    public List<Category> Categories { get; } = new();

    //Rispetta ICategoryRepository, filtra per id e per utente
    public Task<Category?> GetByIdAsync(int id, Guid userId) =>
        Task.FromResult(Categories.FirstOrDefault(c => c.Id == id && c.UserId == userId));

    //
    public Task<IReadOnlyList<Category>> GetByUserAsync(Guid userId, bool includeArchived) => throw new NotImplementedException();
    public Task<Category?> FindByNameAsync(Guid userId, string name) => throw new NotImplementedException();
    public Task AddAsync(Category category) => throw new NotImplementedException();
    public Task<bool> IsInUseAsync(int categoryId) => throw new NotImplementedException();
    public Task DeleteAsync(Category category) => throw new NotImplementedException();
    public Task SaveChangesAsync() => throw new NotImplementedException();
}