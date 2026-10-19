using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;

namespace Spiccioli.Api.Services;

//Operazioni sui piani mensili dell'utente
public interface IMonthlyBudgetService
{
    //Il piano del mese, creato se non esiste (Created indica se è stato appena creato);
    // Validation se il mese non è valido o è oltre dodici mesi nel futuro
    Task<Result<(MonthlyBudgetResponse Budget, bool Created)>> OpenAsync(Guid userId, int year, int month);
}