using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;

namespace Spiccioli.Api.Services;

//Operazioni sui buoni pasto dell'utente
public interface IVoucherService
{
    //Valore del buono, credito rimasto e buoni rimasti
    Task<VoucherSummaryResponse> GetSummaryAsync(Guid userId);

    //Imposta o cambia il valore del buono: gli usi già registrati non cambiano
    Task<VoucherSummaryResponse> SetValueAsync(Guid userId, UpdateVoucherSettingsRequest request);

    //Ricariche dell'utente, dalla più recente
    Task<IReadOnlyList<VoucherTopUpResponse>> GetTopUpsAsync(Guid userId);

    //Registra una ricarica del credito
    Task<VoucherTopUpResponse> AddTopUpAsync(Guid userId, CreateVoucherTopUpRequest request);

    //Elimina una ricarica; NotFound se non esiste, Conflict se il credito diventerebbe negativo
    Task<Result<bool>> DeleteTopUpAsync(Guid userId, int id);

    //Usi dell'utente, dal più recente
    Task<IReadOnlyList<VoucherUsageResponse>> GetUsagesAsync(Guid userId);

    //Registra un uso; Validation se il valore del buono non è impostato o il credito non basta
    Task<Result<VoucherUsageResponse>> AddUsageAsync(Guid userId, CreateVoucherUsageRequest request);

    //Elimina un uso e restituisce il credito; false se non esiste
    Task<bool> DeleteUsageAsync(Guid userId, int id);
}
