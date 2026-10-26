using Spiccioli.Api.Models;

namespace Spiccioli.Api.Repositories;

//Accesso ai piani mensili, sempre filtrati per utente, con le voci e i pagamenti previsti
public interface IMonthlyBudgetRepository
{
    //Il piano di quel mese, con le loro categorie e pagamenti previsti; null se non esiste
    Task<MonthlyBudget?> GetAsync(Guid userId, int year, int month);

    //L'ultimo piano esistente prima di quel mese, con le voci e le loro categorie; null se non ce n'è
    Task<MonthlyBudget?> GetLatestBeforeAsync(Guid userId, int year, int month);

    //Salva un nuovo piano con voci e pagamenti, tutto insieme.
    // False se nel frattempo un'altra richiesta ha già creato il piano di quel mese
    Task<bool> TryAddAsync(MonthlyBudget budget);

    //Salva le modifiche al piano tracciato, comprese le voci aggiunte, cambiate o tolte dalla lista
    Task SaveChangesAsync();

    //I piani dell'utente da quel mese in avanti, con i pagamenti previsti, tracciati per poterli modificare
    Task<IReadOnlyList<MonthlyBudget>> GetFromMonthAsync(Guid userId, int year, int month);

    //Tra i pagamenti indicati, quelli già saldati (con una transazione collegata)
    Task<HashSet<int>> GetPaidPaymentIdsAsync(IEnumerable<int> plannedPaymentIds);

    //Le transazioni che hanno saldato i pagamenti indicati, per Id del pagamento: servono l'importo e la data del pagamento vero
    Task<IReadOnlyDictionary<int, Transaction>> GetPaymentTransactionsAsync(IEnumerable<int> plannedPaymentIds);

    //Un pagamento previsto, solo se appartiene a un piano dell'utente, con la sua spesa ricorrente; null altrimenti
    Task<PlannedPayment?> GetPlannedPaymentAsync(Guid userId, int plannedPaymentId);
}