using Microsoft.AspNetCore.Mvc;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Services;

namespace Spiccioli.Api.Controllers;

//Endpoint HTTP delle transazioni
[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _service;

    public TransactionsController(ITransactionService service)
    {
        _service = service;
    }

    //Restituisce tutte le transazioni dell'utente (filtri facoltativi)
    // GET /api/transactions?from={data}&to={data}&categoryId={id}&page={n}&pageSize={n}
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
        var created = await _service.CreateAsync(GetCurrentUserId(), request);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    //Sostituisce i dati modificabili, oppure 404
    // PUT /api/transactions/{id}
    [HttpPut("{id:int}")]
    public async Task<ActionResult<TransactionResponse>> Update(int id, UpdateTransactionRequest request)
    {
        var updated = await _service.UpdateAsync(GetCurrentUserId(), id, request);
        return updated is null ? NotFound() : Ok(updated);
    }

    //Elimina una transazione, 204 se eliminata, altrimenti 404
    // DELETE /api/transactions/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(GetCurrentUserId(), id);
        return deleted ? NoContent() : NotFound();
    }



    // TEMPORANEO fino alla Fase 9: utente di prova fisso, poi letto dal token JWT
    private Guid GetCurrentUserId()
    {
        return Guid.Parse("11111111-1111-1111-1111-111111111111");
    }
}