using Spiccioli.Api.Common;
using Spiccioli.Api.Models;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Services;

public class PlannedPaymentSynchronizer : IPlannedPaymentSynchronizer
{
        private readonly IMonthlyBudgetRepository _budgets;
        private readonly TimeProvider _time; 

    public PlannedPaymentSynchronizer(IMonthlyBudgetRepository budgets, TimeProvider time)
    {
        _budgets = budgets;
        _time = time;
    }

    public async Task SyncAsync(RecurringExpense expense)
    {
        //Solo dal mese corrente in avanti: il passato non si tocca mai
        var today = DateOnly.FromDateTime(_time.GetLocalNow().DateTime);
        var budgets = await _budgets.GetFromMonthAsync(expense.UserId, today.Year, today.Month);

        //I pagamenti già generati da questa spesa, e quali di loro sono già saldati
        var paymentIds = budgets
            .SelectMany(b => b.PlannedPayments)
            .Where(p => p.RecurringExpenseId == expense.Id)
            .Select(p => p.Id)
            .ToList();
        var paidIds = await _budgets.GetPaidPaymentIdsAsync(paymentIds);

        foreach (var budget in budgets)
        {
            var dueDate = RecurrenceSchedule.GetDueDate(
                expense.StartDate, expense.EndDate, expense.Frequency, budget.Year, budget.Month);
            var payment = budget.PlannedPayments.FirstOrDefault(p => p.RecurringExpenseId == expense.Id);

            //Già saldato: è nello storico, non si tocca
            if (payment is not null && paidIds.Contains(payment.Id))
            {
                continue;
            }

            //Non scade più in questo mese: si toglie (EF Core lo elimina, perché orfano)
            if (dueDate is null)
            {
                if (payment is not null)
                {
                    budget.PlannedPayments.Remove(payment);
                }
                continue;
            }

            //Scade e non c'è ancora: si aggiunge, collegato tramite la navigazione
            if (payment is null)
            {
                budget.PlannedPayments.Add(new PlannedPayment
                {
                    Name = expense.Name,
                    Amount = expense.Amount,
                    DueDate = dueDate.Value,
                    RecurringExpense = expense,
                });
                continue;
            }

            //Scade e c'è già: si aggiorna con i dati attuali della spesa
            payment.Name = expense.Name;
            payment.Amount = expense.Amount;
            payment.DueDate = dueDate.Value;
        }
    }
}