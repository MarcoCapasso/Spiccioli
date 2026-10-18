using Spiccioli.Api.Common;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Services;

public interface ICategoryValidator
{
    //Null se la categoria esiste ed è dell'utente, altrimenti errore di validazione
    Task<Error?> ValidateAsync(Guid userId, int categoryId, TransactionType expectedType, string field);
}