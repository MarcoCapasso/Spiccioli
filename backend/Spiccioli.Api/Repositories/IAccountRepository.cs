using Spiccioli.Api.Models;

namespace Spiccioli.Api.Repositories;

//Operazioni sull'intero account di un utente: esportazione ed eliminazione
public interface IAccountRepository
{
    //Tutti i movimenti dell'utente, dal più vecchio, con il nome della categoria
    Task<IReadOnlyList<Transaction>> GetTransactionsAsync(Guid userId);

    //Elimina tutti i dati dell'utente e l'utente stesso, in un'unica transazione
    Task DeleteAllAsync(Guid userId);
}