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

    public async Task<(IReadOnlyList<Transaction> Items, int TotalCount)> GetByUserAsync(
    Guid userId, DateOnly? from, DateOnly? to, int? categoryId, int page, int pageSize)
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

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.Id)    //senza le pagine si sovrappongono
            .Skip((page - 1) * pageSize)    //salta le pagine precedenti
            .Take(pageSize)                 //prende solo la pagina
            .ToListAsync();                 //Qui tutti i Where diventano un'unica query SQL

        return (items, totalCount);
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