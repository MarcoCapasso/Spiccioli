using Spiccioli.Api.Dtos;
using Spiccioli.Api.Common;

namespace Spiccioli.Api.Services;

public interface ITransactionService
{
    // Una pagina delle transazioni dell'utente come DTO, filtrate secondo il TransactionFilter
    Task<PagedResponse<TransactionResponse>> GetByUserAsync(Guid userId, TransactionFilter filter);
    
    //Una transazione dell'utente come DTO, oppure null se non esiste o non è sua
    Task<TransactionResponse?> GetByIdAsync(Guid userId, int id);
    
    //Crea una transazione per l'utente a partire dalla richiesta del client
    Task<Result<TransactionResponse>> CreateAsync(Guid userId, CreateTransactionRequest request);

    //Sostituisce i dati modificabili di una transazione dell'utente; null se non esiste o non è sua
    Task<Result<TransactionResponse>> UpdateAsync(Guid userId, int id, UpdateTransactionRequest request);

    //Elimina una transazione solo se appartiene all'utente
    Task<bool> DeleteAsync(Guid userId, int id);

    //Entrate, uscite e saldo dell'utente, filtrati secondo il TransactionSummaryFilter
    Task<TransactionSummaryResponse> GetSummaryAsync(Guid userId, TransactionSummaryFilter filter);
    
    //Saldo totale raggruppato per ogni categoria
    Task<IReadOnlyList<CategoryTotalResponse>> GetTotalsByCategoryAsync(Guid userId, DateRangeFilter filter);
}