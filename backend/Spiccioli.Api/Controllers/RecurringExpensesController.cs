using Microsoft.AspNetCore.Mvc;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Services;

namespace Spiccioli.Api.Controllers;

//Endpoint HTTP delle spese ricorrenti
[ApiController]
[Route("api/recurring-expenses")]
public class RecurringExpensesController : ApiControllerBase
{
    private readonly IRecurringExpenseService _service;

    public RecurringExpensesController(IRecurringExpenseService service)
    {
        _service = service;
    }

    //Tutte le spese ricorrenti dell'utente, in ordine di nome
    // GET /api/recurringexpenses
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RecurringExpenseResponse>>> GetAll()
    {
        var expenses = await _service.GetByUserAsync(GetCurrentUserId());
        return Ok(expenses);
    }

    //Una spesa dell'utente, oppure 404
    // GET /api/recurringexpenses/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<RecurringExpenseResponse>> GetById(int id)
    {
        var expense = await _service.GetByIdAsync(GetCurrentUserId(), id);
        return expense is null ? NotFound() : Ok(expense);
    }

    //Crea una spesa ricorrente: 201, oppure 400 se la categoria non è valida
    // POST /api/recurringexpenses
    [HttpPost]
    public async Task<ActionResult<RecurringExpenseResponse>> Create(CreateRecurringExpenseRequest request)
    {
        var result = await _service.CreateAsync(GetCurrentUserId(), request);
        if (!result.IsSuccess)
        {
            return ToProblem(result.Error!);
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    //Sostituisce i dati: 200, 404 se non esiste, 400 se la categoria non è valida
    // PUT /api/recurringexpenses/{id}
    [HttpPut("{id:int}")]
    public async Task<ActionResult<RecurringExpenseResponse>> Update(int id, UpdateRecurringExpenseRequest request)
    {
        var result = await _service.UpdateAsync(GetCurrentUserId(), id, request);
        if (!result.IsSuccess)
        {
            return ToProblem(result.Error!);
        }

        return Ok(result.Value);
    }

    //Elimina se mai usata, altrimenti la termina: 204 in entrambi i casi, 404 se non esiste
    // DELETE /api/recurringexpenses/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(GetCurrentUserId(), id);
        return deleted ? NoContent() : NotFound();
    }
}