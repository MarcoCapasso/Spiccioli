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
}