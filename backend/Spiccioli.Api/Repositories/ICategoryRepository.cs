using Spiccioli.Api.Models;

namespace Spiccioli.Api.Repositories;

public interface ICategoryRepository
{
    //Categorie dell'utente in ordine alfabetico, quelle archiviate solo se richieste
    Task<IReadOnlyList<Category>> GetByUserAsync(Guid userId, bool includeArchived);

    //Una categoria, solo dell'utente
    Task<Category?> GetByIdAsync(int id, Guid userId);

    //Ricerca per nome per impedire duplicati
    Task<Category?> FindByNameAsync(Guid userId, string name);

    //Salva una nuova categoria
    Task AddAsync(Category category);

    //true se la categoria è usata da transazioni, voci del budget o spese ricorrenti
    Task<bool> IsInUseAsync(int categoryId);

    //Elimina fisicamente una categoria (solo se MAI usata)
    Task DeleteAsync(Category category);

    //Salva nel database le modifiche 
    Task SaveChangesAsync();

    //Registra più categorie senza salvarle
    void AddRange(IEnumerable<Category> categories);
}