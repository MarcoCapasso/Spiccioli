using Microsoft.EntityFrameworkCore;
using Spiccioli.Api.Data;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Repositories;

//Accesso ai dati delle spese ricorrenti tramite EF Core
public class RecurringExpenseRepository : IRecurringExpenseRepository
{
    private readonly AppDbContext _context;

    //Dependency Injection per utilizzare DbContext
    public RecurringExpenseRepository(AppDbContext context)
    {
        _context = context;
    }

    //Solo le spese dell'utente, con la categoria per il nome nella risposta
    public async Task<IReadOnlyList<RecurringExpense>> GetByUserAsync(Guid userId)
    {
        //Solo i pagamenti ricorrenti dell'utente
        return await _context.RecurringExpenses
            .AsNoTracking()
            .Include(r => r.Category)
            .Where(r => r.UserId == userId)
            .OrderBy(r => r.Name)
            .ToListAsync();
    }

    //Senza AsNoTracking: il Service modifica la spesa (aggiornamento o terminazione)
    public async Task<RecurringExpense?> GetByIdAsync(int id, Guid userId)
    {
        return await _context.RecurringExpenses                  
            .Include(r => r.Category)
            .Where(r => r.UserId == userId && r.Id == id)   
            .FirstOrDefaultAsync();
    }

    public async Task AddAsync(RecurringExpense expense)
    {
        _context.RecurringExpenses.Add(expense);
        await _context.SaveChangesAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(RecurringExpense expense)
    {
        _context.RecurringExpenses.Remove(expense);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> HasPlannedPaymentsAsync(int recurringExpenseId)
    {
        return await _context.PlannedPayments.AnyAsync(p => p.RecurringExpenseId == recurringExpenseId);
    }
}