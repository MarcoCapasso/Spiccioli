using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;

namespace Spiccioli.Api.Services;

//Operazioni sulle spese ricorrenti dell'utente
public interface IRecurringExpenseService
{
    //Spese ricorrenti dell'utente come DTO, in ordine di nome
    Task<IReadOnlyList<RecurringExpenseResponse>> GetByUserAsync(Guid userId);

    //Una spesa dell'utente come DTO, oppure null se non esiste o non è sua
    Task<RecurringExpenseResponse?> GetByIdAsync(Guid userId, int id);

    //Crea una spesa ricorrente; Validation se la categoria non è utilizzabile o non è di uscita
    Task<Result<RecurringExpenseResponse>> CreateAsync(Guid userId, CreateRecurringExpenseRequest request);

    //Sostituisce i dati di una spesa; NotFound se non esiste, Validation se la categoria non è valida
    Task<Result<RecurringExpenseResponse>> UpdateAsync(Guid userId, int id, UpdateRecurringExpenseRequest request);

    //Mai usata: la elimina. Già usata: la termina alla fine del mese corrente. False se non esiste
    Task<bool> DeleteAsync(Guid userId, int id);
}