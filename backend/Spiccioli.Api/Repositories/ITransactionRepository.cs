using Spiccioli.Api.Models;

namespace Spiccioli.Api.Repositories;


public interface ITransactionRepository
{
    //Transazioni di un utente, filtrate per i criteri "non null" dalla più recente
    Task<(IReadOnlyList<Transaction> Items, int TotalCount)> GetByUserAsync(Guid userId, DateOnly? from, DateOnly? to, int? categoryId, int page, int pageSize);
   
    //Transazione solo se appartiene all'utente indicato
    Task<Transaction?> GetByIdAsync(int id, Guid userId);

    //Salva una nuova transazione del database
    Task AddAsync(Transaction transaction);

    //Salva nel database le modifiche agli oggetti 
    Task SaveChangesAsync();

    //Elimina una transazione solo se appartiene all'utente
    Task<bool> DeleteAsync(int id, Guid userId);

    //Somma di entrate e uscite dell'utente, con gli stessi filtri dell'elenco
    Task<(decimal TotalIncome, decimal TotalExpense)> GetTotalsAsync(Guid userId, DateOnly? from, DateOnly? to, int? categoryId);    

    //Totale per categoria e tipo nel periodo, dal più alto; CategoryName null = senza categoria
    Task<IReadOnlyList<(int? CategoryId, string? CategoryName, TransactionType Type, decimal Total)>> GetTotalsByCategoryAsync(Guid userId, DateOnly? from, DateOnly? to);
}