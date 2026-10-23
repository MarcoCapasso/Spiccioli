using Microsoft.AspNetCore.Mvc;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Services;

namespace Spiccioli.Api.Controllers;

//Endpoint HTTP delle transazioni
[ApiController]
[Route("api/transactions")] 
public class TransactionsController : ApiControllerBase
{
    private readonly ITransactionService _service;

    public TransactionsController(ITransactionService service)
    {
        _service = service;
    }

    //Restituisce tutte le transazioni dell'utente (filtri facoltativi)
    // GET /api/transactions?from={data}&to={data}&categoryId={id}&type={Income|Expense}&search={testo}&page={n}&pageSize={n}
    [HttpGet]
    public async Task<ActionResult<PagedResponse<TransactionResponse>>> GetAll([FromQuery] TransactionFilter filter)
    {
        var transactions = await _service.GetByUserAsync(GetCurrentUserId(), filter);
        return Ok(transactions);
    }

    //Restituisce una transazione specifica, oppure error 404 se la richiesta viene da un utente esterno
    // GET /api/transactions/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<TransactionResponse>> GetById(int id)
    {
        var transaction = await _service.GetByIdAsync(GetCurrentUserId(), id);

        return transaction is null ? NotFound() : Ok(transaction);   
    }

    //Resoconto
    // GET /api/transactions/summary?from={data}&to={data}&categoryId={id}
    [HttpGet("summary")]
    public async Task<ActionResult<TransactionSummaryResponse>> GetSummary([FromQuery] TransactionSummaryFilter filter)
    {
        var summary = await _service.GetSummaryAsync(GetCurrentUserId(), filter);

        return Ok(summary);
    }

    //Restituisce il resoconto per categoria
    // GET /api/transactions/summary/by-category?from={data}&to={data}
    [HttpGet("summary/by-category")]
    public async Task<ActionResult<IReadOnlyList<CategoryTotalResponse>>> GetTotalsByCategory([FromQuery] DateRangeFilter filter)
    {
        var totals = await _service.GetTotalsByCategoryAsync(GetCurrentUserId(), filter);
        return Ok(totals);
    }
    

    //Crea una transazione e restituisce Codice 201 
    // POST /api/transactions
    [HttpPost]
    public async Task<ActionResult<TransactionResponse>> Create(CreateTransactionRequest request)
    {
        var result = await _service.CreateAsync(GetCurrentUserId(), request);
        if (!result.IsSuccess)
        {
            return ToProblem(result.Error!);
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    //Sostituisce i dati modificabili, oppure 404
    // PUT /api/transactions/{id}
    [HttpPut("{id:int}")]
    public async Task<ActionResult<TransactionResponse>> Update(int id, UpdateTransactionRequest request)
    {
        var result = await _service.UpdateAsync(GetCurrentUserId(), id, request);
        if (!result.IsSuccess)
        {
            return ToProblem(result.Error!);
        }

        return Ok(result.Value);
    }

    //Elimina una transazione, 204 se eliminata, altrimenti 404
    // DELETE /api/transactions/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(GetCurrentUserId(), id);
        return deleted ? NoContent() : NotFound();
    }

}