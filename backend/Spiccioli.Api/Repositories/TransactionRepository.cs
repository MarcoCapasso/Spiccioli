using Microsoft.EntityFrameworkCore;
using Spiccioli.Api.Data;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Repositories;


public class TransactionRepository : ITransactionRepository
{
    private readonly AppDbContext _context;

    //Dependency Injection per utilizzare DbContext
    public TransactionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Transaction>> GetByUserAsync(
    Guid userId, DateOnly? from, DateOnly? to, int? categoryId)
    {
        //Solo le transazioni dell'utente, nessun filtro
        var query = _context.Transactions
            .AsNoTracking()
            .Include(t => t.Category)
            .Where(t => t.UserId == userId);

        //Ogni filtro si aggiunge solo se richiesto (null = nessun filtro)
        if (from is not null)
        {
            query = query.Where(t => t.Date >= from.Value);
        }

        if (to is not null)
        {
            query = query.Where(t => t.Date <= to.Value);
        }

        if (categoryId is not null)
        {
            query = query.Where(t => t.CategoryId == categoryId.Value);
        }

        return await query
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.Id)
            .ToListAsync(); // Qui tutti i Where diventano un'unica query SQL
    }

    public async Task<Transaction?> GetByIdAsync(int id, Guid userId)
    {
        return await _context.Transactions                  //Niente AsNoTracking: il risultato può essere modificato e salvato dal Service
            .Include(t => t.Category)
            .Where(t => t.UserId == userId && t.Id == id)   //solo se appartiene all'utente che richiede altrimenti null, come se non esistesse
            .FirstOrDefaultAsync();
    }

    public async Task AddAsync(Transaction transaction)
    {
       _context.Transactions.Add(transaction);  //Registra la transazione nel tracciamento
       await _context.SaveChangesAsync();       //invia l'INSERT al database
    }

}