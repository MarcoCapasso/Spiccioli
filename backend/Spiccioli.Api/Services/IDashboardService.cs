using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;

namespace Spiccioli.Api.Services;

//Il riepilogo di un mese: previsto contro reale
public interface IDashboardService
{
    //L'andamento del mese; NotFound se il piano non è stato aperto
    Task<Result<DashboardResponse>> GetAsync(Guid userId, int year, int month);
}