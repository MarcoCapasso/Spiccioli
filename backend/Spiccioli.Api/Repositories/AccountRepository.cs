using Microsoft.EntityFrameworkCore;
using Spiccioli.Api.Data;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Repositories;

public class AccountRepository : IAccountRepository
{
    private readonly AppDbContext _context;

    public AccountRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Transaction>> GetTransactionsAsync(Guid userId)
    {
        return await _context.Transactions
            .AsNoTracking()
            .Include(t => t.Category)
            .Where(t => t.UserId == userId)
            .OrderBy(t => t.Date)
            .ThenBy(t => t.Id)
            .ToListAsync();
    }

    public async Task DeleteAllAsync(Guid userId)
    {
        //Una transazione: o si cancella tutto, o niente
        await using var transaction = await _context.Database.BeginTransactionAsync();

        //L'ordine rispetta le chiavi esterne: prima chi punta, poi chi è puntato
        await _context.Transactions.Where(t => t.UserId == userId).ExecuteDeleteAsync();
        await _context.PlannedPayments.Where(p => p.MonthlyBudget!.UserId == userId).ExecuteDeleteAsync();
        await _context.BudgetAllocations.Where(b => b.MonthlyBudget!.UserId == userId).ExecuteDeleteAsync();
        await _context.MonthlyBudgets.Where(m => m.UserId == userId).ExecuteDeleteAsync();
        await _context.RecurringExpenses.Where(r => r.UserId == userId).ExecuteDeleteAsync();
        await _context.Categories.Where(c => c.UserId == userId).ExecuteDeleteAsync();
        await _context.Users.Where(u => u.Id == userId).ExecuteDeleteAsync();

        await transaction.CommitAsync();
    }
}