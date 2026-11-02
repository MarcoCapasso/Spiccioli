using Microsoft.EntityFrameworkCore;
using Spiccioli.Api.Data;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Repositories;

//Accesso ai dati dei buoni pasto tramite EF Core
public class VoucherRepository : IVoucherRepository
{
    private readonly AppDbContext _context;

    //Dependency Injection per utilizzare DbContext
    public VoucherRepository(AppDbContext context)
    {
        _context = context;
    }

    //Senza AsNoTracking: il Service modifica il valore
    public async Task<VoucherSettings?> GetSettingsAsync(Guid userId)
    {
        return await _context.VoucherSettings
            .Where(s => s.UserId == userId)
            .FirstOrDefaultAsync();
    }

    public void AddSettings(VoucherSettings settings)
    {
        _context.VoucherSettings.Add(settings);
    }

    public async Task<IReadOnlyList<VoucherTopUp>> GetTopUpsAsync(Guid userId)
    {
        return await _context.VoucherTopUps
            .AsNoTracking()
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.Id)
            .ToListAsync();
    }

    //Senza AsNoTracking: il Service la può eliminare
    public async Task<VoucherTopUp?> GetTopUpAsync(int id, Guid userId)
    {
        return await _context.VoucherTopUps
            .Where(t => t.UserId == userId && t.Id == id)
            .FirstOrDefaultAsync();
    }

    public void AddTopUp(VoucherTopUp topUp)
    {
        _context.VoucherTopUps.Add(topUp);
    }

    public void RemoveTopUp(VoucherTopUp topUp)
    {
        _context.VoucherTopUps.Remove(topUp);
    }

    public async Task<IReadOnlyList<VoucherUsage>> GetUsagesAsync(Guid userId)
    {
        return await _context.VoucherUsages
            .AsNoTracking()
            .Where(u => u.UserId == userId)
            .OrderByDescending(u => u.Date)
            .ThenByDescending(u => u.Id)
            .ToListAsync();
    }

    //Senza AsNoTracking: il Service lo può eliminare
    public async Task<VoucherUsage?> GetUsageAsync(int id, Guid userId)
    {
        return await _context.VoucherUsages
            .Where(u => u.UserId == userId && u.Id == id)
            .FirstOrDefaultAsync();
    }

    public void AddUsage(VoucherUsage usage)
    {
        _context.VoucherUsages.Add(usage);
    }

    public void RemoveUsage(VoucherUsage usage)
    {
        _context.VoucherUsages.Remove(usage);
    }

    //La somma la fa il database: con nessuna riga il risultato è 0
    public async Task<decimal> GetTotalTopUpsAsync(Guid userId)
    {
        return await _context.VoucherTopUps
            .Where(t => t.UserId == userId)
            .SumAsync(t => t.Amount);
    }

    //Ogni uso vale il numero di buoni per il valore che aveva quel giorno
    public async Task<decimal> GetTotalUsedAsync(Guid userId)
    {
        return await _context.VoucherUsages
            .Where(u => u.UserId == userId)
            .SumAsync(u => u.Count * u.UnitValue);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
