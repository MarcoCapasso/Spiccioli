using Spiccioli.Api.Dtos;

namespace Spiccioli.Api.Services;

public interface ITransactionService
{
    // Una pagina delle transazioni dell'utente come DTO, filtrate secondo il TransactionFilter
    Task<PagedResponse<TransactionResponse>> GetByUserAsync(Guid userId, TransactionFilter filter);
    
    //Una transazione dell'utente come DTO, oppure null se non esiste o non è sua
    Task<TransactionResponse?> GetByIdAsync(int id, Guid userId);
    
    //Crea una transazione per l'utente a partire dalla richiesta del client
    Task<TransactionResponse> CreateAsync(Guid userId, CreateTransactionRequest request);

    // Entrate, uscite e saldo dell'utente, filtrati secondo il TransactionSummaryFilter
    Task<TransactionSummaryResponse> GetSummaryAsync(Guid userId, TransactionSummaryFilter filter);
}