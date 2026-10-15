using Spiccioli.Api.Models;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Tests.Fakes;


public class FakeTransactionRepository : ITransactionRepository
{
    private int _nextId = 1;

    //finto database popolato dai vari test del Service
    public List<Transaction> Transactions { get; } = new();

    public Task<Transaction?> GetByIdAsync(int id, Guid userId) =>
        Task.FromResult(Transactions.FirstOrDefault(c => c.Id == id && c.UserId == userId));

    public Task<(IReadOnlyList<Transaction> Items, int TotalCount)> GetByUserAsync(Guid userId, DateOnly? from, DateOnly? to, int? categoryId, int page, int pageSize) => throw new NotImplementedException();
    public Task AddAsync(Transaction transaction)
    {
        transaction.Id = _nextId++;
        Transactions.Add(transaction);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync() => throw new NotImplementedException();
    public Task<bool> DeleteAsync(int id, Guid userId) => throw new NotImplementedException();
    public Task<(decimal TotalIncome, decimal TotalExpense)> GetTotalsAsync(Guid userId, DateOnly? from, DateOnly? to, int? categoryId) => throw new NotImplementedException();
    public Task<IReadOnlyList<(int? CategoryId, string? CategoryName, TransactionType Type, decimal Total)>> GetTotalsByCategoryAsync(Guid userId, DateOnly? from, DateOnly? to) => throw new NotImplementedException();
}