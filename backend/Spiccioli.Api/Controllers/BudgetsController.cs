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

    public BudgetsController(IMonthlyBudgetService service)
    {
        _service = service;
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
}