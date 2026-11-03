using Spiccioli.Api.Models;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Tests.Fakes;

//Repository finto in memoria per i buoni pasto
public class FakeVoucherRepository : IVoucherRepository
{
    //finto database popolato dai vari test
    public List<VoucherSettings> Settings { get; } = new();
    public List<VoucherTopUp> TopUps { get; } = new();
    public List<VoucherUsage> Usages { get; } = new();

    //Quante volte è stato chiesto di salvare
    public int SaveChangesCount { get; private set; }

    //Come il vero database: assegna un Id progressivo alle nuove righe
    private int _nextId = 1;

    public Task<VoucherSettings?> GetSettingsAsync(Guid userId) =>
        Task.FromResult(Settings.FirstOrDefault(s => s.UserId == userId));

    public void AddSettings(VoucherSettings settings) => Settings.Add(settings);

    public Task<IReadOnlyList<VoucherTopUp>> GetTopUpsAsync(Guid userId) =>
        Task.FromResult<IReadOnlyList<VoucherTopUp>>(
            TopUps.Where(t => t.UserId == userId).OrderByDescending(t => t.Date).ThenByDescending(t => t.Id).ToList());

    //Come il vero: filtra per id e per utente
    public Task<VoucherTopUp?> GetTopUpAsync(int id, Guid userId) =>
        Task.FromResult(TopUps.FirstOrDefault(t => t.Id == id && t.UserId == userId));

    public void AddTopUp(VoucherTopUp topUp)
    {
        topUp.Id = _nextId++;
        TopUps.Add(topUp);
    }

    public void RemoveTopUp(VoucherTopUp topUp) => TopUps.Remove(topUp);

    public Task<IReadOnlyList<VoucherUsage>> GetUsagesAsync(Guid userId) =>
        Task.FromResult<IReadOnlyList<VoucherUsage>>(
            Usages.Where(u => u.UserId == userId).OrderByDescending(u => u.Date).ThenByDescending(u => u.Id).ToList());

    public Task<VoucherUsage?> GetUsageAsync(int id, Guid userId) =>
        Task.FromResult(Usages.FirstOrDefault(u => u.Id == id && u.UserId == userId));

    public void AddUsage(VoucherUsage usage)
    {
        usage.Id = _nextId++;
        Usages.Add(usage);
    }

    public void RemoveUsage(VoucherUsage usage) => Usages.Remove(usage);

    public Task<decimal> GetTotalTopUpsAsync(Guid userId) =>
        Task.FromResult(TopUps.Where(t => t.UserId == userId).Sum(t => t.Amount));

    public Task<decimal> GetTotalUsedAsync(Guid userId) =>
        Task.FromResult(Usages.Where(u => u.UserId == userId).Sum(u => u.Count * u.UnitValue));

    public Task SaveChangesAsync()
    {
        SaveChangesCount++;
        return Task.CompletedTask;
    }
}
