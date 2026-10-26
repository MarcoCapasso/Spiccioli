using Spiccioli.Api.Models;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Tests.Fakes;

//Repository finto in memoria
public class FakeMonthlyBudgetRepository : IMonthlyBudgetRepository
{
    //finto database popolato dai vari test
    public List<MonthlyBudget> Budgets { get; } = new();

    //Gli Id dei pagamenti già saldati: lo decide il test
    public HashSet<int> PaidPaymentIds { get; } = new();

    public Task<MonthlyBudget?> GetAsync(Guid userId, int year, int month) =>
        Task.FromResult(Budgets.FirstOrDefault(b => b.UserId == userId && b.Year == year && b.Month == month));

    //Come il vero: dell'utente, dal mese indicato in avanti, in ordine di mese
    public Task<IReadOnlyList<MonthlyBudget>> GetFromMonthAsync(Guid userId, int year, int month) =>
        Task.FromResult<IReadOnlyList<MonthlyBudget>>(
            Budgets
                .Where(b => b.UserId == userId && (b.Year > year || (b.Year == year && b.Month >= month)))
                .OrderBy(b => b.Year).ThenBy(b => b.Month)
                .ToList());

    public Task<HashSet<int>> GetPaidPaymentIdsAsync(IEnumerable<int> plannedPaymentIds) =>
        Task.FromResult(plannedPaymentIds.Where(PaidPaymentIds.Contains).ToHashSet());

    //Le modifiche sono già sugli oggetti in lista, non c'è nulla da salvare
    public Task SaveChangesAsync() => Task.CompletedTask;

    public Task<MonthlyBudget?> GetLatestBeforeAsync(Guid userId, int year, int month) => throw new NotImplementedException();
    public Task<bool> TryAddAsync(MonthlyBudget budget) => throw new NotImplementedException();
    public Task<IReadOnlyDictionary<int, Transaction>> GetPaymentTransactionsAsync(IEnumerable<int> plannedPaymentIds) => throw new NotImplementedException();
    public Task<PlannedPayment?> GetPlannedPaymentAsync(Guid userId, int plannedPaymentId) => throw new NotImplementedException();
}