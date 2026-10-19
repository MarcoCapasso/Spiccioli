using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;

namespace Spiccioli.Api.Services;

//Operazioni sui piani mensili dell'utente
public interface IMonthlyBudgetService
{
    //Il piano del mese, creato se non esiste (Created indica se è stato appena creato);
    // Validation se il mese non è valido o è oltre dodici mesi nel futuro
    Task<Result<(MonthlyBudgetResponse Budget, bool Created)>> OpenAsync(Guid userId, int year, int month);

    //Imposta entrate previste e obiettivo di risparmio; NotFound se il piano del mese non è stato aperto
    Task<Result<MonthlyBudgetResponse>> UpdateAsync(Guid userId, int year, int month, UpdateBudgetRequest request);

    //Inserisce o aggiorna la voce di una categoria; NotFound se il piano non esiste, Validation se la categoria non è utilizzabile
    Task<Result<MonthlyBudgetResponse>> SetAllocationAsync(Guid userId, int year, int month, int categoryId, SetAllocationRequest request);

    //Toglie la voce di una categoria dal piano; false se il piano o la voce non esistono
    Task<bool> RemoveAllocationAsync(Guid userId, int year, int month, int categoryId);
}