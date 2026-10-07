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

    public async Task<IReadOnlyList<Transaction>> GetByUserAsync(Guid userId)
    {
        return await _context.Transactions
            .AsNoTracking()                     //Solo lettura, no tracciamento
            .Include(t => t.Category)           //Carica anche la categoria collegata
            .Where(t => t.UserId == userId)     //Prende solo le transazioni dell'utente
            .OrderByDescending(t => t.Date)     //Ordina a partire dalla più recente
            .ThenByDescending(t => t.Id)        //Se due transazioni hanno la stessa data, l'ultima va inserita prima 
            .ToListAsync();
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