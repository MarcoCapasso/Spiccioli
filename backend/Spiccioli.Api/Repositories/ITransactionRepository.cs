using Spiccioli.Api.Models;

namespace Spiccioli.Api.Repositories;


public interface ITransactionRepository
{
    //Transazioni di un utente, filtrate per i criteri "non null" dalla più recente
    Task<IReadOnlyList<Transaction>> GetByUserAsync(
        Guid userId, DateOnly? from, DateOnly? to, int? categoryId);

    //Transazione solo se appartiene all'utente indicato
    Task<Transaction?> GetByIdAsync(int id, Guid userId);

    //Salva una nuova transazione del database
    Task AddAsync(Transaction transaction);
}