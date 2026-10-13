using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Models;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Services;

//Regole e conversione DTO a modello
public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _repository;
    private readonly ICategoryRepository _categoryRepository;

    //Paginazione predefinita del client
    private const int DefaultPage = 1;
    private const int DefaultPageSize = 20;

    //Riceve il contratto da Repository
    public TransactionService(ITransactionRepository repository, ICategoryRepository categoryRepository)
    {
        _repository = repository;
        _categoryRepository = categoryRepository;
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

    public async Task<TransactionResponse?> GetByIdAsync(Guid userId, int id)
    {
        var transaction = await _repository.GetByIdAsync(id, userId);

        //Non trovata (o non dell'utente): null; altrimenti la risposta
        return transaction is null ? null : ToResponse(transaction);
    }

    //Crea la transazione
     public async Task<Result<TransactionResponse>> CreateAsync(Guid userId, CreateTransactionRequest request)
    {
        var categoryError = await ValidateCategoryAsync(userId, request.CategoryId, request.Type);
        if (categoryError is not null)
        {
            return Result<TransactionResponse>.Failure(categoryError);
        }   

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

        //Ricarica con la categoria inclusa
        var created = await _repository.GetByIdAsync(transaction.Id, userId)
            ?? throw new InvalidOperationException("Transazione appena creata non trovata.");

        return Result<TransactionResponse>.Success(ToResponse(created));
    }

    //Aggiorna la transazione
    public async Task<Result<TransactionResponse>> UpdateAsync(Guid userId, int id, UpdateTransactionRequest request)
    {
        //Caricata con tracciamento e EF Core rileva automaticamente i campi modificati
        var transaction = await _repository.GetByIdAsync(id, userId);
        if (transaction is null)
        {
            return Result<TransactionResponse>.Failure(Error.NotFound("Transazione non trovata"));
        }

        var categoryError = await ValidateCategoryAsync(userId, categoryId: request.CategoryId, type: request.Type);
        if (categoryError is not null)
        {
            return Result<TransactionResponse>.Failure(categoryError);
        }

        transaction.Amount = request.Amount;
        transaction.Date = request.Date;
        transaction.Type = request.Type;
        transaction.CategoryId = request.CategoryId;
        transaction.Description = request.Description;

        await _repository.SaveChangesAsync();

        //Ricarica
        var updated = await _repository.GetByIdAsync(id, userId)
            ?? throw new InvalidOperationException("Transazione appena modificata non trovata");
        
        return Result<TransactionResponse>.Success(ToResponse(updated));
    }

    //Elimina la transazione
    public async Task<bool> DeleteAsync(Guid userId, int id)
    {
        return await _repository.DeleteAsync(id, userId);
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

    private async Task<Error?> ValidateCategoryAsync(Guid userId, int categoryId, TransactionType type)
    {
        var field = nameof(CreateTransactionRequest.CategoryId);
        var category = await _categoryRepository.GetByIdAsync(categoryId, userId);

        if (category is null)
        {
            //Il messaggio è lo stesso sia se la categoria non esiste sia se appartiene a qualcun'altro
            return Error.Validation(field, "La categoria indicata non esiste.");
        }

        if (category.IsArchived)
        {
            return Error.Validation(field, "La categoria è archiviata: ripristinala o scegline un'altra.");
        }

        if (category.Type != type)
        {
            return Error.Validation(field, "Il tipo della categoria non corrisponde a quello della transazione.");
        }

        return null;
    }
}