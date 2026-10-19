using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Models;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Services;

//Il pulsante "Pagato": trasforma un pagamento previsto in una transazione reale
public class PlannedPaymentService : IPlannedPaymentService
{
    private readonly IMonthlyBudgetRepository _budgets;
    private readonly ITransactionRepository _transactions;
    private readonly ICategoryValidator _categoryValidator;

    public PlannedPaymentService(
        IMonthlyBudgetRepository budgets, ITransactionRepository transactions, ICategoryValidator categoryValidator)
    {
        _budgets = budgets;
        _transactions = transactions;
        _categoryValidator = categoryValidator;
    }

    public async Task<Result<TransactionResponse>> PayAsync(
        Guid userId, int plannedPaymentId, PayPlannedPaymentRequest request)
    {
        var payment = await _budgets.GetPlannedPaymentAsync(userId, plannedPaymentId);
        if (payment is null)
        {
            return Result<TransactionResponse>.Failure(Error.NotFound("Pagamento previsto non trovato."));
        }

        //Già saldato: un secondo "Pagato" non crea una seconda transazione
        var paidIds = await _budgets.GetPaidPaymentIdsAsync([payment.Id]);
        if (paidIds.Count > 0)
        {
            return Result<TransactionResponse>.Failure(Error.Conflict("Questo pagamento risulta già saldato."));
        }

        //La categoria è quella della spesa ricorrente (inclusa dal Repository, relazione obbligatoria).
        //Il client non l'ha inviata, quindi l'eventuale errore non riguarda un suo campo
        var categoryId = payment.RecurringExpense!.CategoryId;
        var categoryError = await _categoryValidator.ValidateAsync(
            userId, categoryId, expectedType: TransactionType.Expense, field: string.Empty);
        if (categoryError is not null)
        {
            return Result<TransactionResponse>.Failure(categoryError);
        }

        //Importo e data reali (regola 7); il collegamento al pagamento lo rende saldato (regola 8)
        var transaction = new Transaction
        {
            Amount = request.Amount,
            Date = request.Date,
            Type = TransactionType.Expense,
            CategoryId = categoryId,
            Description = payment.Name,
            PlannedPaymentId = payment.Id,
            UserId = userId,
        };

        await _transactions.AddAsync(transaction);

        //Ricarica con la categoria inclusa, come per ogni transazione creata
        var created = await _transactions.GetByIdAsync(transaction.Id, userId)
            ?? throw new InvalidOperationException("Transazione del pagamento appena creata non trovata.");

        return Result<TransactionResponse>.Success(TransactionResponse.FromTransaction(created));
    }
}