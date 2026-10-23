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
        Guid userId, TransactionCriteria criteria, int page, int pageSize)
    {
        var query = _context.Transactions
            .AsNoTracking()
            .Include(t => t.Category)
            .Where(t => t.UserId == userId);

        query = ApplyFilters(query, criteria);

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

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(int id, Guid userId)
    {
        var deletedRows = await _context.Transactions
            .Where(t => t.Id == id && t.UserId == userId)
            .ExecuteDeleteAsync();
        
        return deletedRows > 0;
    }

    public async Task<TransactionTotals> GetTotalsAsync(Guid userId, TransactionCriteria criteria)
    {
        var query = _context.Transactions.Where(t => t.UserId == userId);
        query = ApplyFilters(query, criteria);

        //Il database raggruppa per tipo, somma e conta: tornano al massimo due righe
        var groups = await query
            .GroupBy(t => t.Type)
            .Select(g => new { Type = g.Key, Total = g.Sum(t => t.Amount), Count = g.Count() })
            .ToListAsync();

        //Un tipo senza transazioni non forma nessun gruppo: totale e conteggio sono zero
        var income = groups.FirstOrDefault(g => g.Type == TransactionType.Income);
        var expense = groups.FirstOrDefault(g => g.Type == TransactionType.Expense);

        return new TransactionTotals(
            income?.Total ?? 0, expense?.Total ?? 0, income?.Count ?? 0, expense?.Count ?? 0);
    }

    public async Task<IReadOnlyList<(int? CategoryId, string? CategoryName, TransactionType Type, decimal Total, int Count)>>
        GetTotalsByCategoryAsync(Guid userId, DateOnly? from, DateOnly? to)
    {
        var query = _context.Transactions.Where(t => t.UserId == userId);
        query = ApplyFilters(query, new TransactionCriteria(from, to));

        //Chiave composta categoria e tipo, entrate e uscite non si mescolano mai
        var groups = await query
            .GroupBy(t => new
            {
                t.CategoryId,
                CategoryName = t.Category == null ? null : t.Category.Name,
                t.Type
            })
            
        .Select(g => new { g.Key.CategoryId, g.Key.CategoryName, g.Key.Type, Total = g.Sum(t => t.Amount), Count = g.Count() })
        .OrderByDescending(x => x.Total)   // Ordinato dal database, per totale
        .ToListAsync();

        return groups.Select(x => (x.CategoryId, x.CategoryName, x.Type, x.Total, x.Count)).ToList();
    }

    //Unico punto dove vengono applicati i filtri sulle transazioni
    private static IQueryable<Transaction> ApplyFilters(IQueryable<Transaction> query, TransactionCriteria criteria)
    {
        if (criteria.From is not null)
            query = query.Where(t => t.Date >= criteria.From.Value);

        if (criteria.To is not null)
            query = query.Where(t => t.Date <= criteria.To.Value);

        if (criteria.CategoryId is not null)
            query = query.Where(t => t.CategoryId == criteria.CategoryId.Value);

        if (criteria.Type is not null)
            query = query.Where(t => t.Type == criteria.Type.Value);

        var search = criteria.Search?.Trim();
        if (!string.IsNullOrEmpty(search))
        {
            //% e _ sono caratteri speciali di LIKE: si neutralizzano, così "50%" cerca davvero "50%"
            var escaped = search.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
            var pattern = $"%{escaped}%";

            //Senza maiuscole, in descrizione, nota e nome della categoria
            query = query.Where(t =>
                EF.Functions.ILike(t.Description!, pattern) ||
                EF.Functions.ILike(t.Note!, pattern) ||
                (t.Category != null && EF.Functions.ILike(t.Category.Name, pattern)));
        }

        return query;
    }

}