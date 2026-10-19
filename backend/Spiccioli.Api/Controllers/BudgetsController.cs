using Microsoft.AspNetCore.Mvc;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Services;

namespace Spiccioli.Api.Controllers;

//Endpoint HTTP dei piani mensili
[ApiController]
[Route("api/budgets")]
public class BudgetsController : ApiControllerBase
{
    private readonly IMonthlyBudgetService _service;
    private readonly IDashboardService _dashboard;

    public BudgetsController(IMonthlyBudgetService service, IDashboardService dashboard)
    {
        _service = service;
        _dashboard = dashboard;
    }

    //Apre il piano del mese, lo crea se non esiste: 201 se appena creato, 200 se esisteva già.
    // POST /api/budgets/{year}/{month}
    [HttpPost("{year:int}/{month:int}")]
    public async Task<ActionResult<MonthlyBudgetResponse>> Open(int year, int month)
    {
        var result = await _service.OpenAsync(GetCurrentUserId(), year, month);
        if (!result.IsSuccess)
        {
            return ToProblem(result.Error!);
        }

        var (budget, created) = result.Value;

        return created
            ? StatusCode(StatusCodes.Status201Created, budget)
            : Ok(budget);
    }

    //Inserisce o aggiorna la voce di una categoria: 200 con il piano, 404 se il piano non esiste, 400 se la categoria non è valida
    // PUT /api/budgets/{year}/{month}/allocations/{categoryId}
    [HttpPut("{year:int}/{month:int}/allocations/{categoryId:int}")]
    public async Task<ActionResult<MonthlyBudgetResponse>> SetAllocation(
        int year, int month, int categoryId, SetAllocationRequest request)
    {
        var result = await _service.SetAllocationAsync(GetCurrentUserId(), year, month, categoryId, request);
        if (!result.IsSuccess)
        {
            return ToProblem(result.Error!);
        }

        return Ok(result.Value);
    }

    //Imposta entrate previste e obiettivo di risparmio: 200 con il piano, 404 se non è stato aperto
    //PUT /api/budgets/{year}/{month}
    [HttpPut("{year:int}/{month:int}")]
    public async Task<ActionResult<MonthlyBudgetResponse>> Update(int year, int month, UpdateBudgetRequest request)
    {
        var result = await _service.UpdateAsync(GetCurrentUserId(), year, month, request);
        if (!result.IsSuccess)
        {
            return ToProblem(result.Error!);
        }

        return Ok(result.Value);
    }

    //Toglie la voce di una categoria: 204, oppure 404 se il piano o la voce non esistono
    //DELETE /api/budgets/{year}/{month}/allocations/{categoryId}
    [HttpDelete("{year:int}/{month:int}/allocations/{categoryId:int}")]
    public async Task<IActionResult> RemoveAllocation(int year, int month, int categoryId)
    {
        var removed = await _service.RemoveAllocationAsync(GetCurrentUserId(), year, month, categoryId);
        return removed ? NoContent() : NotFound();
    }

    //L'andamento del mese, previsto contro reale: 200, oppure 404 se il piano non è stato aperto.
    // GET /api/budgets/{year}/{month}/dashboard
    [HttpGet("{year:int}/{month:int}/dashboard")]
    public async Task<ActionResult<DashboardResponse>> GetDashboard(int year, int month)
    {
        var result = await _dashboard.GetAsync(GetCurrentUserId(), year, month);
        if (!result.IsSuccess)
        {
            return ToProblem(result.Error!);
        }

        return Ok(result.Value);
    }

}