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

    public void Add(RecurringExpense expense)
    {
        _context.RecurringExpenses.Add(expense);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    //Elimina fisicamente la spesa insieme alle sue scadenze non saldate
    public async Task DeleteAsync(RecurringExpense expense)
    {
        //Scadenze e spesa spariscono insieme, o non sparisce nulla
        await using var transaction = await _context.Database.BeginTransactionAsync();

        //Solo le scadenze senza una transazione collegata: se una saldata fosse rimasta,
        //il database rifiuterebbe l'eliminazione della spesa (NoAction) invece di cancellare lo storico
        await _context.PlannedPayments
            .Where(p => p.RecurringExpenseId == expense.Id)
            .Where(p => !_context.Transactions.Any(t => t.PlannedPaymentId == p.Id))
            .ExecuteDeleteAsync();

        _context.RecurringExpenses.Remove(expense);
        await _context.SaveChangesAsync();

        await transaction.CommitAsync();
    }

    //Restituisce true se almeno una scadenza della spesa è stata saldata da una transazione
    public async Task<bool> HasPaidPaymentsAsync(int recurringExpenseId)
    {
        return await _context.Transactions.AnyAsync(t =>
            t.PlannedPayment != null && t.PlannedPayment.RecurringExpenseId == recurringExpenseId);
    }

    //Gli Id tra quelli indicati, delle spese che hanno almeno una scadenza saldata
    public async Task<HashSet<int>> GetIdsWithPaidPaymentsAsync(IEnumerable<int> recurringExpenseIds)
    {
        var ids = recurringExpenseIds.ToList();

        var paid = await _context.Transactions
            .Where(t => t.PlannedPayment != null && ids.Contains(t.PlannedPayment.RecurringExpenseId))
            .Select(t => t.PlannedPayment!.RecurringExpenseId)
            .Distinct()
            .ToListAsync();

        return paid.ToHashSet();
    }
}