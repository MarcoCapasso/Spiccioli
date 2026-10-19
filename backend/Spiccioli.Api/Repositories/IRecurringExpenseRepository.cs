using Spiccioli.Api.Models;

namespace Spiccioli.Api.Repositories;

//Accesso alle spese ricorrenti, sempre filtrate per utente
public interface IRecurringExpenseRepository
{
    //Spese ricorrenti dell'utente ordinate per nome, con la categoria inclusa
    Task<IReadOnlyList<RecurringExpense>> GetByUserAsync(Guid userId);

    //Una spesa, solo dell'utente, tracciata per poterla modificare; null se non esiste o non è sua
    Task<RecurringExpense?> GetByIdAsync(int id, Guid userId);

    //Registra una nuova spesa senza salvarla: il salvataggio avviene insieme ai piani sincronizzati
    void Add(RecurringExpense expense);

    //Salva nel database le modifiche
    Task SaveChangesAsync();

    //Elimina fisicamente una spesa (solo se MAI usata per generare pagamenti)
    Task DeleteAsync(RecurringExpense expense);

    //Restituisce true se la spesa ha generato almeno un pagamento previsto
    Task<bool> HasPlannedPaymentsAsync(int recurringExpenseId);
}