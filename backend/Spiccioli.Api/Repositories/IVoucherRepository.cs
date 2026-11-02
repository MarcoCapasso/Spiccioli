using Spiccioli.Api.Models;

namespace Spiccioli.Api.Repositories;

//Accesso ai dati dei buoni pasto, sempre filtrato per utente
public interface IVoucherRepository
{
    //Le impostazioni dell'utente, tracciate per poterle modificare; null se il valore non è mai stato impostato
    Task<VoucherSettings?> GetSettingsAsync(Guid userId);

    //Registra le impostazioni senza salvarle
    void AddSettings(VoucherSettings settings);

    //Ricariche dell'utente, dalla più recente
    Task<IReadOnlyList<VoucherTopUp>> GetTopUpsAsync(Guid userId);

    //Una ricarica, solo dell'utente, tracciata per poterla eliminare; null se non esiste o non è sua
    Task<VoucherTopUp?> GetTopUpAsync(int id, Guid userId);

    void AddTopUp(VoucherTopUp topUp);
    void RemoveTopUp(VoucherTopUp topUp);

    //Usi dell'utente, dal più recente
    Task<IReadOnlyList<VoucherUsage>> GetUsagesAsync(Guid userId);

    //Un uso, solo dell'utente, tracciato per poterlo eliminare; null se non esiste o non è suo
    Task<VoucherUsage?> GetUsageAsync(int id, Guid userId);

    void AddUsage(VoucherUsage usage);
    void RemoveUsage(VoucherUsage usage);

    //Totale in euro di tutte le ricariche dell'utente
    Task<decimal> GetTotalTopUpsAsync(Guid userId);

    //Totale in euro di tutti gli usi dell'utente: numero di buoni per il loro valore di allora
    Task<decimal> GetTotalUsedAsync(Guid userId);

    //Salva nel database le modifiche
    Task SaveChangesAsync();
}
