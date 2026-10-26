using Spiccioli.Api.Repositories;
using Spiccioli.Api.Common;
using Spiccioli.Api.Models;
using Spiccioli.Api.Dtos;

namespace Spiccioli.Api.Services;

//Apertura e modifica dei piani mensili: entrate, risparmio e voci di spesa
public class MonthlyBudgetService : IMonthlyBudgetService
{
    private readonly IMonthlyBudgetRepository _budgets;
    private readonly IRecurringExpenseRepository _recurringExpenses;
    private readonly TimeProvider _time;
    private readonly ICategoryValidator _categoryValidator;

    public MonthlyBudgetService(IMonthlyBudgetRepository budgets, IRecurringExpenseRepository recurringExpenses, TimeProvider time, ICategoryValidator categoryValidator)
    {
        _budgets = budgets;
        _recurringExpenses = recurringExpenses;
        _time = time;
        _categoryValidator = categoryValidator;
    }

    public async Task<Result<(MonthlyBudgetResponse Budget, bool Created)>> OpenAsync(Guid userId, int year, int month)
    {
        var monthError = ValidateMonth(year, month);
        if (monthError is not null)
        {
            return Result<(MonthlyBudgetResponse, bool)>.Failure(monthError);
        }

        //Il piano esiste già: lo si restituisce così com'è
        var existing = await _budgets.GetAsync(userId, year, month);
        if (existing is not null)
        {
            return Result<(MonthlyBudgetResponse, bool)>.Success((await ToResponseAsync(existing), false));
        }

        var budget = await BuildNewBudgetAsync(userId, year, month);

        if (!await _budgets.TryAddAsync(budget))
        {
            //Creato un istante prima da un'altra richiesta: si restituisce il suo, senza errori
            var createdByOther = await _budgets.GetAsync(userId, year, month)
                ?? throw new InvalidOperationException("Piano creato da un'altra richiesta ma non trovato.");
            return Result<(MonthlyBudgetResponse, bool)>.Success((await ToResponseAsync(createdByOther), false));
        }

        //Ricarica con le categorie delle voci, per avere i nomi nella risposta
        var saved = await _budgets.GetAsync(userId, year, month)
            ?? throw new InvalidOperationException("Piano appena creato non trovato.");

        return Result<(MonthlyBudgetResponse, bool)>.Success((await ToResponseAsync(saved), true));
    }

    //Imposta entrate previste e obiettivo di risparmio del piano
    public async Task<Result<MonthlyBudgetResponse>> UpdateAsync(Guid userId, int year, int month, UpdateBudgetRequest request)
    {
        var budget = await _budgets.GetAsync(userId, year, month);
        if (budget is null)
        {
            return Result<MonthlyBudgetResponse>.Failure(Error.NotFound("Piano del mese non trovato: aprilo prima di modificarlo."));
        }

        budget.PlannedIncome = request.PlannedIncome;
        budget.SavingsTarget = request.SavingsTarget;

        await _budgets.SaveChangesAsync();

        //Nessuna ricarica: cambiano solo due valori del piano, le voci e le loro categorie sono già caricate
        return Result<MonthlyBudgetResponse>.Success(await ToResponseAsync(budget));
    }


    public async Task<Result<MonthlyBudgetResponse>> SetAllocationAsync(Guid userId, int year, int month, int categoryId, SetAllocationRequest request)
    {
        var budget = await _budgets.GetAsync(userId, year, month);
        if (budget is null)
        {
            return Result<MonthlyBudgetResponse>.Failure(Error.NotFound("Piano del mese non trovato: aprilo prima di modificarlo."));
        }

        //Le voci sono solo per categorie di uscita, utilizzabili dall'utente
        var categoryError = await _categoryValidator.ValidateAsync(
            userId, categoryId, expectedType: TransactionType.Expense, field: nameof(categoryId));
        if (categoryError is not null)
        {
            return Result<MonthlyBudgetResponse>.Failure(categoryError);
        }

        //Inserisce o aggiorna: una sola voce per categoria
        var allocation = budget.Allocations.FirstOrDefault(a => a.CategoryId == categoryId);
        if (allocation is null)
        {
            budget.Allocations.Add(new BudgetAllocation { CategoryId = categoryId, Amount = request.Amount });
        }
        else
        {
            allocation.Amount = request.Amount;
        }

        await _budgets.SaveChangesAsync();

        //Ricarica per avere il nome della categoria anche sulla voce appena aggiunta
        var updated = await _budgets.GetAsync(userId, year, month)
            ?? throw new InvalidOperationException("Piano appena modificato non trovato.");

        return Result<MonthlyBudgetResponse>.Success(await ToResponseAsync(updated));
    }

    public async Task<bool> RemoveAllocationAsync(Guid userId, int year, int month, int categoryId)
    {
        var budget = await _budgets.GetAsync(userId, year, month);
        if (budget is null)
        {
            return false;
        }

        var allocation = budget.Allocations.FirstOrDefault(a => a.CategoryId == categoryId);
        if (allocation is null)
        {
            return false;
        }

        budget.Allocations.Remove(allocation);
        await _budgets.SaveChangesAsync();

        return true;

    }


    private async Task<MonthlyBudget> BuildNewBudgetAsync(Guid userId, int year, int month)
    {
        var previous = await _budgets.GetLatestBeforeAsync(userId, year, month);
        var expenses = await _recurringExpenses.GetByUserAsync(userId);

        var budget = new MonthlyBudget
        {
            UserId = userId,
            Year = year,
            Month = month,
            //Dall'ultimo piano, oppure da zero se è il primo
            PlannedIncome = previous?.PlannedIncome ?? 0m,
            SavingsTarget = previous?.SavingsTarget ?? 0m,
        };

        if (previous is not null)
        {
            //Le voci delle categorie archiviate non si copiano: un nuovo piano è una nuova operazione
            foreach (var allocation in previous.Allocations.Where(a => a.Category is not null && !a.Category.IsArchived))
            {
                budget.Allocations.Add(new BudgetAllocation { CategoryId = allocation.CategoryId, Amount = allocation.Amount });
            }
        }

        //I pagamenti previsti non si copiano mai: si generano dalle spese ricorrenti
        foreach (var expense in expenses)
        {
            var dueDate = RecurrenceSchedule.GetDueDate(
                expense.StartDate, expense.EndDate, expense.Frequency, year, month);
            if (dueDate is null)
            {
                continue;
            }

            //Nome, importo e data copiati: se la spesa cambierà, questo mese resterà com'è
            budget.PlannedPayments.Add(new PlannedPayment
            {
                Name = expense.Name,
                Amount = expense.Amount,
                DueDate = dueDate.Value,
                RecurringExpenseId = expense.Id,
            });
        }

        return budget;
    }


    private Error? ValidateMonth(int year, int month)
    {
        if (month < 1 || month > 12)
        {
            return Error.Validation("Month", "Il mese deve essere compreso tra 1 e 12.");
        }

        var today = DateOnly.FromDateTime(_time.GetLocalNow().DateTime);

        //Quanti mesi separano il mese corrente da quello richiesto (negativo se è nel passato)
        var monthsAhead = (year - today.Year) * 12 + (month - today.Month);

        if (monthsAhead > 12)
        {
            return Error.Validation("Month", "Si può pianificare al massimo dodici mesi in avanti.");
        }

        return null;
    }


    //Conversione modello a DTO, con le voci in ordine di categoria e i pagamenti in ordine di scadenza.
    // Asincrona: per sapere quali pagamenti sono saldati serve una query sulle transazioni
    private async Task<MonthlyBudgetResponse> ToResponseAsync(MonthlyBudget budget)
    {
        var paidIds = await _budgets.GetPaidPaymentIdsAsync(budget.PlannedPayments.Select(p => p.Id));

        var allocations = budget.Allocations
            .OrderBy(a => a.Category?.Name)
            .Select(a => new BudgetAllocationResponse(a.CategoryId, a.Category?.Name, a.Amount))
            .ToList();

        var plannedPayments = budget.PlannedPayments
            .OrderBy(p => p.DueDate).ThenBy(p => p.Name)
            .Select(p => new PlannedPaymentResponse(p.Id, p.Name, p.Amount, p.DueDate, paidIds.Contains(p.Id), p.RecurringExpenseId))
            .ToList();

        return new MonthlyBudgetResponse(
            budget.Id,
            budget.Year,
            budget.Month,
            budget.PlannedIncome,
            budget.SavingsTarget,
            allocations,
            plannedPayments);
    }

}