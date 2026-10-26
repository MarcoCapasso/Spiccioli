using Spiccioli.Api.Models;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Tests.Fakes;

//Repository finto in memoria
public class FakeRecurringExpenseRepository : IRecurringExpenseRepository
{
    //finto database popolato dai vari test
    public List<RecurringExpense> Expenses { get; } = new();

    //Gli Id delle spese che hanno già almeno una scadenza saldata: lo decide il test
    public HashSet<int> WithPaidPayments { get; } = new();

    //Quante volte è stato chiesto di salvare
    public int SaveChangesCount { get; private set; }

    public Task<IReadOnlyList<RecurringExpense>> GetByUserAsync(Guid userId) =>
        Task.FromResult<IReadOnlyList<RecurringExpense>>(
            Expenses.Where(e => e.UserId == userId).OrderBy(e => e.Name).ToList());

    //Come il vero: filtra per id e per utente
    public Task<RecurringExpense?> GetByIdAsync(int id, Guid userId) =>
        Task.FromResult(Expenses.FirstOrDefault(e => e.Id == id && e.UserId == userId));

    public void Add(RecurringExpense expense) => Expenses.Add(expense);

    public Task SaveChangesAsync()
    {
        SaveChangesCount++;
        return Task.CompletedTask;
    }

    //L'eliminazione fisica: la spesa sparisce dalla lista
    public Task DeleteAsync(RecurringExpense expense)
    {
        Expenses.Remove(expense);
        return Task.CompletedTask;
    }

    public Task<bool> HasPaidPaymentsAsync(int recurringExpenseId) =>
        Task.FromResult(WithPaidPayments.Contains(recurringExpenseId));

    public Task<HashSet<int>> GetIdsWithPaidPaymentsAsync(IEnumerable<int> recurringExpenseIds) =>
        Task.FromResult(recurringExpenseIds.Where(WithPaidPayments.Contains).ToHashSet());
}