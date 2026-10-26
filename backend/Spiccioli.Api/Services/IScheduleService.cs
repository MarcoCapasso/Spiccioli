using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;

namespace Spiccioli.Api.Services;

//Le scadenze di un mese, in sola lettura
public interface IScheduleService
{
    //Dal piano se è aperto, altrimenti calcolate dalle spese ricorrenti; Validation se l'anno o il mese non sono validi
    Task<Result<ScheduleResponse>> GetAsync(Guid userId, int year, int month);
}