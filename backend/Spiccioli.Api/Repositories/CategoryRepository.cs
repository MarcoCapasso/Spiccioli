using Microsoft.EntityFrameworkCore;
using Spiccioli.Api.Models;
using Spiccioli.Api.Data;


namespace Spiccioli.Api.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _context;

    //Dependency Injection per utilizzare DbContext
    public CategoryRepository(AppDbContext context)
    {
        _context = context;
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

        return await query
            .OrderBy(c => c.Name)
            .ToListAsync();
    }
    
    public async Task<Category?> GetByIdAsync(int id, Guid userId)
    {
        return await _context.Categories
            .Where(c => c.Id == id && c.UserId == userId)
            .FirstOrDefaultAsync();
    }

    public async Task<Category?> FindByNameAsync(Guid userId, string name)
    {
        //il confronto avviene nel database
        return await _context.Categories
            .AsNoTracking()
            .Where(c => c.UserId == userId && c.Name.ToLower() == name.ToLower())
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