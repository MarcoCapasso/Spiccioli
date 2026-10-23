using Spiccioli.Api.Models;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Tests.Fakes;


public class FakeTransactionRepository : ITransactionRepository
{
    private int _nextId = 1;

    //finto database popolato dai vari test del Service
    public List<Transaction> Transactions { get; } = new();

    //L'ultimo criterio ricevuto: serve ai test per verificare cosa il Service ha passato
    public TransactionCriteria? LastCriteria { get; private set; }

    public Task<Transaction?> GetByIdAsync(int id, Guid userId) =>
        Task.FromResult(Transactions.FirstOrDefault(c => c.Id == id && c.UserId == userId));

    public Task<(IReadOnlyList<Transaction> Items, int TotalCount)> GetByUserAsync(
        Guid userId, TransactionCriteria criteria, int page, int pageSize)
    {
        LastCriteria = criteria;
        return Task.FromResult(((IReadOnlyList<Transaction>)new List<Transaction>(), 0));
    }

    public Task AddAsync(Transaction transaction)
    {
        transaction.Id = _nextId++;
        Transactions.Add(transaction);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync() => throw new NotImplementedException();
    public Task<bool> DeleteAsync(int id, Guid userId) => throw new NotImplementedException();

    public Task<TransactionTotals> GetTotalsAsync(Guid userId, TransactionCriteria criteria)
    {
        LastCriteria = criteria;
        return Task.FromResult(new TransactionTotals(0, 0, 0, 0));
    }

    public Task<IReadOnlyList<(int? CategoryId, string? CategoryName, TransactionType Type, decimal Total, int Count)>> GetTotalsByCategoryAsync(Guid userId, DateOnly? from, DateOnly? to) => throw new NotImplementedException();

}