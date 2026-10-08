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

    //Restituisce tutte le transazioni dell'utente
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TransactionResponse>>> GetAll()
    {
        var transaction = await _service.GetByUserAsync(GetCurrentUserId());
        return Ok(transaction);
    }

    //Restituisce una transazione specifica, oppure error 404 se la richiesta viene da un utente che non è proprietario della transazione
    [HttpGet("{id:int}")]
    public async Task<ActionResult<TransactionResponse>> GetById(int id)
    {
        var transaction = await _service.GetByIdAsync(id, GetCurrentUserId());

        return transaction is null ? NotFound() : Ok(transaction);   
    }

    //Crea una transazione e restituisce Codice 201 
    [HttpPost]
    public async Task<ActionResult<TransactionResponse>> Create(CreateTransactionRequest request)
    {
        var created = await _service.CreateAsync(GetCurrentUserId(), request);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // TEMPORANEO fino alla Fase 8: utente di prova fisso, poi letto dal token JWT
    private Guid GetCurrentUserId()
    {
        return Guid.Parse("11111111-1111-1111-1111-111111111111");
    }
}