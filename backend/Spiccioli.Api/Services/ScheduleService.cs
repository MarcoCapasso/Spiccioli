using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Models;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Services;

//Le scadenze di un mese
public class ScheduleService : IScheduleService
{
    private readonly IMonthlyBudgetRepository _budgets;
    private readonly IRecurringExpenseRepository _recurringExpenses;
    private readonly TimeProvider _time;

    public ScheduleService(IMonthlyBudgetRepository budgets, IRecurringExpenseRepository recurringExpenses, TimeProvider time)
    {
        _budgets = budgets;
        _recurringExpenses = recurringExpenses;
        _time = time;
    }

    public async Task<Result<ScheduleResponse>> GetAsync(Guid userId, int year, int month)
    {
        if (month < 1 || month > 12)
        {
            return Result<ScheduleResponse>.Failure(Error.Validation("Month", "Il mese deve essere compreso tra 1 e 12."));
        }

        if (year < 2000 || year > 2100)
        {
            return Result<ScheduleResponse>.Failure(Error.Validation("Year", "L'anno deve essere compreso tra 2000 e 2100."));
        }

        var today = DateOnly.FromDateTime(_time.GetLocalNow().DateTime);
        var expenses = (await _recurringExpenses.GetByUserAsync(userId)).ToDictionary(e => e.Id);
        var budget = await _budgets.GetAsync(userId, year, month);

        var payments = budget is null
            ? BuildFromExpenses(expenses.Values, year, month)
            : await BuildFromBudgetAsync(budget, expenses, today);

        var ordered = payments.OrderBy(p => p.DueDate).ThenBy(p => p.Name).ToList();

        return Result<ScheduleResponse>.Success(new ScheduleResponse(
            year,
            month,
            budget is not null,
            ordered,
            ordered.Sum(p => p.Amount),
            ordered.Sum(p => p.PaidAmount ?? 0m),
            ordered.Where(p => !p.IsPaid).Sum(p => p.Amount)));
    }

    //Le scadenze del piano con la transazione che le ha saldate se c'è
    private async Task<List<ScheduledPaymentResponse>> BuildFromBudgetAsync(
        MonthlyBudget budget, Dictionary<int, RecurringExpense> expenses, DateOnly today)
    {
        var paid = await _budgets.GetPaymentTransactionsAsync(budget.PlannedPayments.Select(p => p.Id));

        return budget.PlannedPayments.Select(p =>
        {
            //La spesa esiste sempre
            var expense = expenses[p.RecurringExpenseId];
            paid.TryGetValue(p.Id, out var transaction);

            return new ScheduledPaymentResponse(
                p.RecurringExpenseId,
                p.Id,
                p.Name,
                p.Amount,
                p.DueDate,
                expense.CategoryId,
                expense.Category?.Name,
                transaction is not null,
                transaction?.Amount,
                transaction?.Date,
                transaction is null && p.DueDate < today);
        }).ToList();
    }

    private static List<ScheduledPaymentResponse> BuildFromExpenses(
        IEnumerable<RecurringExpense> expenses, int year, int month)
    {
        var payments = new List<ScheduledPaymentResponse>();

        foreach (var expense in expenses)
        {
            var dueDate = RecurrenceSchedule.GetDueDate(
                expense.StartDate, expense.EndDate, expense.Frequency, year, month);
            if (dueDate is null)
            {
                continue;
            }

            payments.Add(new ScheduledPaymentResponse(
                expense.Id, null, expense.Name, expense.Amount, dueDate.Value,
                expense.CategoryId, expense.Category?.Name, false, null, null, false));
        }

        return payments;
    }
}