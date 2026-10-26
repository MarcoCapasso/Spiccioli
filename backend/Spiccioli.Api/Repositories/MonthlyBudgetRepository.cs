using Microsoft.EntityFrameworkCore;
using Npgsql;
using Spiccioli.Api.Data;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Repositories;

//Accesso ai dati dei piani mensili tramite EF Core
public class MonthlyBudgetRepository : IMonthlyBudgetRepository
{
    private readonly AppDbContext _context;

    public MonthlyBudgetRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<MonthlyBudget?> GetAsync(Guid userId, int year, int month)
    {
        return await _context.MonthlyBudgets
            .Include(b => b.Allocations).ThenInclude(a => a.Category)
            .Include(b => b.PlannedPayments)
            .Where(b => b.UserId == userId && b.Year == year && b.Month == month)
            .FirstOrDefaultAsync();
    }

    public async Task<MonthlyBudget?> GetLatestBeforeAsync(Guid userId, int year, int month)
    {
        return await _context.MonthlyBudgets
            .AsNoTracking()
            .Include(b => b.Allocations).ThenInclude(a => a.Category)
            .Where(b => b.UserId == userId && (b.Year < year || (b.Year == year && b.Month < month)))
            .OrderByDescending(b => b.Year).ThenByDescending(b => b.Month)
            .FirstOrDefaultAsync();
    }

    public async Task<bool> TryAddAsync(MonthlyBudget budget)
    {
        _context.MonthlyBudgets.Add(budget);
        try
        {
            await _context.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            _context.ChangeTracker.Clear();
            return false;
        }
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<MonthlyBudget>> GetFromMonthAsync(Guid userId, int year, int month)
    {
        return await _context.MonthlyBudgets
            .Include(b => b.PlannedPayments)
            .Where(b => b.UserId == userId && (b.Year > year || (b.Year == year && b.Month >= month)))
            .ToListAsync();
    }

    public async Task<HashSet<int>> GetPaidPaymentIdsAsync(IEnumerable<int> plannedPaymentIds)
    {
        //Un pagamento è saldato se una transazione lo indica
        var paid = await _context.Transactions
            .Where(t => t.PlannedPaymentId != null && plannedPaymentIds.Contains(t.PlannedPaymentId.Value))
            .Select(t => t.PlannedPaymentId!.Value)
            .ToListAsync();

        return paid.ToHashSet();
    }

    public async Task<IReadOnlyDictionary<int, Transaction>> GetPaymentTransactionsAsync(IEnumerable<int> plannedPaymentIds)
    {
        var ids = plannedPaymentIds.ToList();
        var transactions = await _context.Transactions
            .AsNoTracking()
            .Where(t => t.PlannedPaymentId != null && ids.Contains(t.PlannedPaymentId.Value))
            .ToListAsync();

        return transactions.ToDictionary(t => t.PlannedPaymentId!.Value);
    }

    public async Task<PlannedPayment?> GetPlannedPaymentAsync(Guid userId, int plannedPaymentId)
    {
        return await _context.PlannedPayments
            .AsNoTracking()
            .Include(p => p.RecurringExpense)
            .Where(p => p.Id == plannedPaymentId && p.MonthlyBudget!.UserId == userId)
            .FirstOrDefaultAsync();
    }
}