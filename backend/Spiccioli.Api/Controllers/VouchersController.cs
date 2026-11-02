using Microsoft.AspNetCore.Mvc;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Services;

namespace Spiccioli.Api.Controllers;

//Endpoint HTTP dei buoni pasto
[ApiController]
[Route("api/vouchers")]
public class VouchersController : ApiControllerBase
{
    private readonly IVoucherService _service;

    public VouchersController(IVoucherService service)
    {
        _service = service;
    }

    //Valore del buono, credito rimasto e buoni rimasti
    // GET /api/vouchers/summary
    [HttpGet("summary")]
    public async Task<ActionResult<VoucherSummaryResponse>> GetSummary()
    {
        var summary = await _service.GetSummaryAsync(GetCurrentUserId());
        return Ok(summary);
    }

    //Imposta o cambia il valore del buono, e restituisce il riepilogo aggiornato
    // PUT /api/vouchers/settings
    [HttpPut("settings")]
    public async Task<ActionResult<VoucherSummaryResponse>> SetValue(UpdateVoucherSettingsRequest request)
    {
        var summary = await _service.SetValueAsync(GetCurrentUserId(), request);
        return Ok(summary);
    }

    //Le ricariche dell'utente, dalla più recente
    // GET /api/vouchers/top-ups
    [HttpGet("top-ups")]
    public async Task<ActionResult<IReadOnlyList<VoucherTopUpResponse>>> GetTopUps()
    {
        var topUps = await _service.GetTopUpsAsync(GetCurrentUserId());
        return Ok(topUps);
    }

    //Registra una ricarica: 201
    // POST /api/vouchers/top-ups
    [HttpPost("top-ups")]
    public async Task<ActionResult<VoucherTopUpResponse>> AddTopUp(CreateVoucherTopUpRequest request)
    {
        var topUp = await _service.AddTopUpAsync(GetCurrentUserId(), request);
        return Created($"/api/vouchers/top-ups/{topUp.Id}", topUp);
    }

    //Elimina una ricarica: 204, 404 se non esiste, 409 se il credito diventerebbe negativo
    // DELETE /api/vouchers/top-ups/{id}
    [HttpDelete("top-ups/{id:int}")]
    public async Task<IActionResult> DeleteTopUp(int id)
    {
        var result = await _service.DeleteTopUpAsync(GetCurrentUserId(), id);
        if (!result.IsSuccess)
        {
            return ToProblem(result.Error!);
        }

        return NoContent();
    }

    //Gli usi dell'utente, dal più recente
    // GET /api/vouchers/usages
    [HttpGet("usages")]
    public async Task<ActionResult<IReadOnlyList<VoucherUsageResponse>>> GetUsages()
    {
        var usages = await _service.GetUsagesAsync(GetCurrentUserId());
        return Ok(usages);
    }

    //Registra un uso: 201, oppure 400 se il valore non è impostato o il credito non basta
    // POST /api/vouchers/usages
    [HttpPost("usages")]
    public async Task<ActionResult<VoucherUsageResponse>> AddUsage(CreateVoucherUsageRequest request)
    {
        var result = await _service.AddUsageAsync(GetCurrentUserId(), request);
        if (!result.IsSuccess)
        {
            return ToProblem(result.Error!);
        }

        return Created($"/api/vouchers/usages/{result.Value!.Id}", result.Value);
    }

    //Elimina un uso e restituisce il credito: 204, 404 se non esiste
    // DELETE /api/vouchers/usages/{id}
    [HttpDelete("usages/{id:int}")]
    public async Task<IActionResult> DeleteUsage(int id)
    {
        var deleted = await _service.DeleteUsageAsync(GetCurrentUserId(), id);
        return deleted ? NoContent() : NotFound();
    }
}
