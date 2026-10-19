using Spiccioli.Api.Models;

namespace Spiccioli.Api.Services;

//Allinea i pagamenti previsti dei piani già aperti a una spesa ricorrente (regola 6)
public interface IPlannedPaymentSynchronizer
{
    //Aggiorna i piani dal mese corrente in avanti. Registra le modifiche senza salvarle:
    //il salvataggio lo fa chi chiama, insieme alla spesa, in un'unica transazione
    Task SyncAsync(RecurringExpense expense);
}