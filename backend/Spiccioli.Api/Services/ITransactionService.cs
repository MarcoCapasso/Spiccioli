using Spiccioli.Api.Dtos;

namespace Spiccioli.Api.Services;

public interface ITransactionService
{
    //Tutte le transazioni dell'utente come DTO, dalla più recente
    Task<IReadOnlyList<TransactionResponse>> GetByUserAsync(Guid userId, TransactionFilter filter);
    
    //Una transazione dell'utente come DTO, oppure null se non esiste o non è sua
    Task<TransactionResponse?> GetByIdAsync(int id, Guid userId);
    
    //Crea una transazione per l'utente a partire dalla richiesta del client
    Task<TransactionResponse> CreateAsync(Guid userId, CreateTransactionRequest request);
}