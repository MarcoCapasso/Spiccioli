using Spiccioli.Api.Models;
using Spiccioli.Api.Services;

namespace Spiccioli.Api.Tests.Fakes;

//Sincronizzatore finto: non tocca nessun piano, si limita a ricordare per quali spese è stato chiamato
public class FakePlannedPaymentSynchronizer : IPlannedPaymentSynchronizer
{
    public List<RecurringExpense> Synced { get; } = new();

    public Task SyncAsync(RecurringExpense expense)
    {
        Synced.Add(expense);
        return Task.CompletedTask;
    }
}