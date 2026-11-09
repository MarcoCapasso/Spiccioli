using Microsoft.EntityFrameworkCore;
using Spiccioli.Api.Common;
using Spiccioli.Api.Models;
using Spiccioli.Api.Data;


namespace Spiccioli.Api.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _context;
    private readonly IFieldCipher _cipher;

    //Dependency Injection per utilizzare DbContext e il cifratore (serve per l'impronta dei nomi)
    public CategoryRepository(AppDbContext context, IFieldCipher cipher)
    {
        _context = context;
        _cipher = cipher;
    }

    public async Task<IReadOnlyList<Category>> GetByUserAsync(Guid userId, bool includeArchived)
    {
        //Solo le categorie dell'utente
        var query = _context.Categories
            .AsNoTracking()
            .Where(c => c.UserId == userId);

        //Le archiviate si escludono a meno che non richieste 
        if (!includeArchived)
        {
            query = query.Where(c => !c.IsArchived);
        }

        //I nomi sono cifrati nel database: l'ordine alfabetico si fa qui, sui nomi già in chiaro
        var categories = await query.ToListAsync();

        return categories
            .OrderBy(c => c.Name, StringComparer.InvariantCultureIgnoreCase)
            .ToList();
    }
    
    public async Task<Category?> GetByIdAsync(int id, Guid userId)
    {
        return await _context.Categories
            .Where(c => c.Id == id && c.UserId == userId)
            .FirstOrDefaultAsync();
    }

    public async Task<Category?> FindByNameAsync(Guid userId, string name)
    {
        //Il nome è cifrato: il database confronta le impronte (senza maiuscole), non i nomi
        var key = _cipher.BlindIndex(name);

        return await _context.Categories
            .AsNoTracking()
            .Where(c => c.UserId == userId && c.NameKey == key)
            .FirstOrDefaultAsync();
    }
    
    public async Task AddAsync(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
    }
    
    public async Task<bool> IsInUseAsync(int categoryId)
    {
        return await _context.Transactions.AnyAsync(t => t.CategoryId == categoryId)
            || await _context.BudgetAllocations.AnyAsync(b => b.CategoryId == categoryId)
            || await _context.RecurringExpenses.AnyAsync(r => r.CategoryId == categoryId);
    }
    
    public async Task DeleteAsync(Category category)
    {
        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
    }
     
    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }

    //Registra più categorie senza salvarle
    public void AddRange(IEnumerable<Category> categories)
    {
        _context.Categories.AddRange(categories);
    }

}