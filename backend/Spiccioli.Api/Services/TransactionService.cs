using Spiccioli.Api.Controllers;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Models;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Services;

//Regole e conversione DTO a modello
public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _repository;

    //Paginazione predefinita del client
    private const int DefaultPage = 1;
    private const int DefaultPageSize = 20;

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

    public async Task<PagedResponse<TransactionResponse>> GetByUserAsync(Guid userId, TransactionFilter filter)
    {
        var page = filter.Page ?? DefaultPage;
        var pageSize = filter.PageSize ?? DefaultPageSize;

        var (transactions, totalCount) = await _repository.GetByUserAsync(
            userId, filter.From, filter.To, filter.CategoryId, page, pageSize);

        var items = transactions.Select(t => ToResponse(t)).ToList();

        return new PagedResponse<TransactionResponse>(items, page, pageSize, totalCount);
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

    public async Task<TransactionSummaryResponse> GetSummaryAsync(
    Guid userId, TransactionSummaryFilter filter)
    {
        var (totalIncome, totalExpense) = await _repository.GetTotalsAsync(
            userId, filter.From, filter.To, filter.CategoryId);

        return new TransactionSummaryResponse(totalIncome, totalExpense);
    }

    public async Task<IReadOnlyList<CategoryTotalResponse>> GetTotalsByCategoryAsync(Guid userId, DateRangeFilter filter)
    {
        var totals = await _repository.GetTotalsByCategoryAsync(
            userId, filter.From, filter.To);
        
        return totals
            .Select(x => new CategoryTotalResponse(x.CategoryId, x.CategoryName, x.Type, x.Total))
            .ToList();
        
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