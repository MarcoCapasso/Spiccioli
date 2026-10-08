using Spiccioli.Api.Dtos;
using Spiccioli.Api.Models;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Services;

//Regole e conversione DTO a modello
public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _repository;

    //Riceve il contratto da Repository
    public TransactionService(ITransactionRepository repository)
    {
        _repository = repository;
    }

    public async Task<TransactionResponse?> GetByIdAsync(int id, Guid userId)
    {
        var transaction = await _repository.GetByIdAsync(id, userId);

        //Non trovata (o non dell'utente): null; altrimenti la risposta
        return transaction is null ? null : ToResponse(transaction);
    }

    public async Task<IReadOnlyList<TransactionResponse>> GetByUserAsync(Guid userId, TransactionFilter filter)
    {
        var transactions = await _repository.GetByUserAsync(
            userId, from: filter.From, to: filter.To, categoryId: filter.CategoryId);

        return transactions.Select(t => ToResponse(t)).ToList();
    }

    public async Task<TransactionResponse> CreateAsync(Guid userId, CreateTransactionRequest request)
    {
        var transaction = new Transaction
        {
            Amount = request.Amount,
            Date = request.Date,
            Type = request.Type,
            CategoryId = request.CategoryId,
            Description = request.Description,
            UserId = userId,
        };

        await _repository.AddAsync(transaction);

        // Ricarica con la categoria inclusa: l'oggetto creato qui non ha la navigazione    
        var created = await _repository.GetByIdAsync(transaction.Id, userId)
            ?? throw new InvalidOperationException("Transazione appena creata non trovata.");

        return ToResponse(created);
    }

    //Conversione da modello a DTO di risposta
    private static TransactionResponse ToResponse(Transaction transaction)
    {
        return new TransactionResponse(
            transaction.Id,
            transaction.Amount,
            transaction.Date,
            transaction.Type,
            transaction.Description,
            transaction.CategoryId,
            transaction.Category?.Name
        );
    }
}