using Spiccioli.Api.Dtos;
using Spiccioli.Api.Common;

namespace Spiccioli.Api.Services;

public interface ICategoryService
{
    //Categorie dell'utente in ordine alfabetico, le archiviate solo se richieste
    Task<IReadOnlyList<CategoryResponse>> GetByUserAsync(Guid userId, bool includeArchived);

    //Una categoria dell'utente, oppure null se non esiste o non è sua
    Task<CategoryResponse?> GetByIdAsync(Guid userId, int id);

    //Crea una categoria. il tipo è deciso qui e non cambierà più
    Task<Result<CategoryResponse>> CreateAsync(Guid userId, CreateCategoryRequest request);

    //Rinomina una categoria, null se non esiste o non è sua
    Task<Result<CategoryResponse>> RenameAsync(Guid userId, int id, UpdateCategoryRequest request);

    //Elimina se mai usata, altrimenti archivia; false se non esiste o non è sua
    Task<bool> DeleteAsync(Guid userId, int id);

    //Riattiva una categoria archiviata; null se non esiste o non è sua
    Task<CategoryResponse?> RestoreAsync(Guid userId, int id);
}