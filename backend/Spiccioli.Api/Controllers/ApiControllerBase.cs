using Microsoft.AspNetCore.Mvc;

using Spiccioli.Api.Common;

namespace Spiccioli.Api.Controllers;

// Base comune dei Controller: un solo punto in cui si determina l'utente corrente
public abstract class ApiControllerBase : ControllerBase
{
    // TEMPORANEO fino alla Fase 9: utente di prova fisso, poi letto dal token JWT
    protected Guid GetCurrentUserId()
    {
        return Guid.Parse("11111111-1111-1111-1111-111111111111");
    }

    //Traduce un errore del Service nella risposta HTTP corrispondente, in formato Problem Details
    protected ActionResult ToProblem(Error error)
    {
        if (error.Type == ErrorType.Validation)
        {
            //Stesso formato degli errori delle Data Annotations
            ModelState.AddModelError(error.Field ?? string.Empty, error.Message);
            return ValidationProblem(ModelState);
        }

        var statusCode = error.Type == ErrorType.NotFound
            ? StatusCodes.Status404NotFound
            : StatusCodes.Status409Conflict;

        return Problem(detail: error.Message, statusCode: statusCode);
    }
}