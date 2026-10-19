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
        //"Prima" di un mese: un anno precedente, oppure lo stesso anno con un mese precedente
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
            //Un solo salvataggio: piano, voci e pagamenti in un'unica transazione
            await _context.SaveChangesAsync();
            return true;
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            //Un'altra richiesta ha creato lo stesso mese un istante prima: si scarta il nostro tentativo
            _context.ChangeTracker.Clear();
            return false;
        }
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}