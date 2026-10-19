using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Models;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Services;

//Regole sulle spese ricorrenti e conversione DTO a modello
public class RecurringExpenseService : IRecurringExpenseService
{
    private readonly IRecurringExpenseRepository _repository;
    private readonly ICategoryValidator _categoryValidator;
    private readonly TimeProvider _time;

    //L'orologio arriva dalla DI
    public RecurringExpenseService(
        IRecurringExpenseRepository repository, ICategoryValidator categoryValidator, TimeProvider time)
    {
        _repository = repository;
        _categoryValidator = categoryValidator;
        _time = time;
    }

    public async Task<IReadOnlyList<RecurringExpenseResponse>> GetByUserAsync(Guid userId)
    {
        var expenses = await _repository.GetByUserAsync(userId);
        return expenses.Select(e => ToResponse(e)).ToList();
    }

    public async Task<RecurringExpenseResponse?> GetByIdAsync(Guid userId, int id)
    {
        var recurringExpense = await _repository.GetByIdAsync(id, userId);

        //Non trovata (o non dell'utente): null; altrimenti la risposta
        return recurringExpense is null ? null : ToResponse(recurringExpense);
    }

    public async Task<Result<RecurringExpenseResponse>> CreateAsync(Guid userId, CreateRecurringExpenseRequest request)
    {
        //Una spesa ricorrente è sempre un'uscita: la categoria deve essere di uscita
        var categoryError = await _categoryValidator.ValidateAsync(
            userId, request.CategoryId, expectedType: TransactionType.Expense, field: nameof(request.CategoryId));
        if (categoryError is not null)
        {
            return Result<RecurringExpenseResponse>.Failure(categoryError);
        }

        var expense = new RecurringExpense
        {
            Name = request.Name.Trim(),
            Amount = request.Amount,
            Frequency = request.Frequency,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            CategoryId = request.CategoryId,
            UserId = userId,
        };

        await _repository.AddAsync(expense);

        // Ricarica con la categoria inclusa, come per le transazioni
        var created = await _repository.GetByIdAsync(expense.Id, userId)
            ?? throw new InvalidOperationException("Spesa ricorrente appena creata non trovata.");

        return Result<RecurringExpenseResponse>.Success(ToResponse(created));
    }

    public async Task<Result<RecurringExpenseResponse>> UpdateAsync(Guid userId, int id, UpdateRecurringExpenseRequest request)
    {
        //Caricata con tracciamento e EF Core rileva automaticamente i campi modificati
        var recurringExpense = await _repository.GetByIdAsync(id, userId);
        if (recurringExpense is null)
        {
            return Result<RecurringExpenseResponse>.Failure(Error.NotFound("Spesa ricorrente non trovata"));
        }

        var categoryError = await _categoryValidator.ValidateAsync(
            userId, request.CategoryId, expectedType: TransactionType.Expense, field: nameof(request.CategoryId));
        if (categoryError is not null)
        {
            return Result<RecurringExpenseResponse>.Failure(categoryError);
        }

        recurringExpense.Name = request.Name.Trim();
        recurringExpense.Amount = request.Amount;
        recurringExpense.Frequency = request.Frequency;
        recurringExpense.StartDate = request.StartDate;
        recurringExpense.EndDate = request.EndDate;
        recurringExpense.CategoryId = request.CategoryId;

        await _repository.SaveChangesAsync();

        //Ricarica
        var updated = await _repository.GetByIdAsync(id, userId)
            ?? throw new InvalidOperationException("Spesa ricorrente appena modificata non trovata");
        
        return Result<RecurringExpenseResponse>.Success(ToResponse(updated));
    }

    //Se mai usata si elimina. Già usata si termina alla fine del mese corrente, conservando lo storico
    public async Task<bool> DeleteAsync(Guid userId, int id)
    {
        var expense = await _repository.GetByIdAsync(id, userId);
        if (expense is null)
        {
            return false;
        }

        if (!await _repository.HasPlannedPaymentsAsync(id))
        {
            await _repository.DeleteAsync(expense);
            return true;
        }

        var today = DateOnly.FromDateTime(_time.GetLocalNow().DateTime);
        var endOfMonth = new DateOnly(today.Year, today.Month, DateTime.DaysInMonth(today.Year, today.Month));

        //Se finisce già prima, non la si prolunga
        if (expense.EndDate is null || expense.EndDate > endOfMonth)
        {
            expense.EndDate = endOfMonth;
            await _repository.SaveChangesAsync();
        }

        return true;
    }

    private static RecurringExpenseResponse ToResponse(RecurringExpense expense)
    {
        return new RecurringExpenseResponse(
            expense.Id,
            expense.Name,
            expense.Amount,
            expense.Frequency,
            expense.StartDate,
            expense.EndDate,
            expense.CategoryId,
            expense.Category?.Name
        );
    }
}       