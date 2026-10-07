using Spiccioli.Api.Models;

namespace Spiccioli.Api.Repositories;


public interface ITransactionRepository
{
    //Tutte le transazioni di un utente, dalla più recente
    Task<IReadOnlyList<Transaction>> GetByUserAsync(Guid userId);

    //Transazione solo se appartiene all'utente indicato
    Task<Transaction?> GetByIdAsync(int id, Guid userId);

    //Salva una nuova transazione del database
    Task AddAsync(Transaction transaction);
}