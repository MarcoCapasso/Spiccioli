using Microsoft.AspNetCore.Mvc;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Services;

namespace Spiccioli.Api.Controllers;

//Endpoint HTTP dei pagamenti previsti
[ApiController]
[Route("api/planned-payments")]
public class PlannedPaymentsController : ApiControllerBase
{
    private readonly IPlannedPaymentService _service;

    public PlannedPaymentsController(IPlannedPaymentService service)
    {
        _service = service;
    }

    //Il pulsante "Pagato": 201 con la transazione creata,
    //404 se il pagamento non esiste, 409 se è già saldato, 400 se la categoria non è utilizzabile
    // POST /api/planned-payments/{id}/pay
    [HttpPost("{id:int}/pay")]
    public async Task<ActionResult<TransactionResponse>> Pay(int id, PayPlannedPaymentRequest request)
    {
        var result = await _service.PayAsync(GetCurrentUserId(), id, request);
        if (!result.IsSuccess)
        {
            return ToProblem(result.Error!);
        }

        //La risorsa creata è una transazione: Location punta al suo indirizzo nelle transazioni
        return CreatedAtAction(
            nameof(TransactionsController.GetById), "Transactions", new { id = result.Value!.Id }, result.Value);
    }
}