using Microsoft.AspNetCore.Mvc;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Services;

namespace Spiccioli.Api.Controllers;

//Endpoint HTTP delle scadenze di un mese
[ApiController]
[Route("api/budgets/{year:int}/{month:int}/schedule")]
public class ScheduleController : ApiControllerBase
{
    private readonly IScheduleService _service;

    public ScheduleController(IScheduleService service)
    {
        _service = service;
    }

    //Le scadenze del mese, dal piano se è aperto
    // GET /api/budgets/{year}/{month}/schedule
    [HttpGet]
    public async Task<ActionResult<ScheduleResponse>> Get(int year, int month)
    {
        var result = await _service.GetAsync(GetCurrentUserId(), year, month);
        if (!result.IsSuccess)
        {
            return ToProblem(result.Error!);
        }

        return Ok(result.Value);
    }
}