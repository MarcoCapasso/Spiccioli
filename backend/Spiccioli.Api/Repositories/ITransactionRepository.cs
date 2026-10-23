using Spiccioli.Api.Models;

namespace Spiccioli.Api.Repositories;


public interface ITransactionRepository
{
    //Transazioni di un utente, filtrate per i criteri presenti, dalla più recente
    Task<(IReadOnlyList<Transaction> Items, int TotalCount)> GetByUserAsync(Guid userId, TransactionCriteria criteria, int page, int pageSize);
   
    //Transazione solo se appartiene all'utente indicato
    Task<Transaction?> GetByIdAsync(int id, Guid userId);

    //Salva una nuova transazione del database
    Task AddAsync(Transaction transaction);

    //Salva nel database le modifiche agli oggetti 
    Task SaveChangesAsync();

    //Elimina una transazione solo se appartiene all'utente
    Task<bool> DeleteAsync(int id, Guid userId);

    //Somma di entrate e uscite dell'utente, con gli stessi criteri dell'elenco
    Task<TransactionTotals> GetTotalsAsync(Guid userId, TransactionCriteria criteria);   

    //Totale per categoria e tipo nel periodo, dal più alto; CategoryName null = senza categoria
    Task<IReadOnlyList<(int? CategoryId, string? CategoryName, TransactionType Type, decimal Total, int Count)>> GetTotalsByCategoryAsync(Guid userId, DateOnly? from, DateOnly? to);
}