using Microsoft.AspNetCore.Mvc;
using Spiccioli.Api.Services;

namespace Spiccioli.Api.Controllers;

//Operazioni sull'intero account; l'identità arriva sempre dal token
[ApiController]
[Route("api/me")]
public class AccountController : ApiControllerBase
{
    private readonly IAccountService _service;

    public AccountController(IAccountService service)
    {
        _service = service;
    }

    //Scarica i movimenti in CSV
    // GET /api/me/export
    [HttpGet("export")]
    public async Task<IActionResult> Export()
    {
        var csv = await _service.ExportTransactionsCsvAsync(GetCurrentUserId());
        return File(csv, "text/csv; charset=utf-8", "spiccioli-movimenti.csv");
    }

    //Elimina l'account e tutti i suoi dati: 204 a operazione riuscita
    // DELETE /api/me
    [HttpDelete]
    public async Task<IActionResult> Delete()
    {
        await _service.DeleteAsync(GetCurrentUserId());
        return NoContent();
    }
}