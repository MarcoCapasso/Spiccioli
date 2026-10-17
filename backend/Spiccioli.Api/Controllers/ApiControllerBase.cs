using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;

using Spiccioli.Api.Common;

namespace Spiccioli.Api.Controllers;


// Base comune dei Controller: un solo punto in cui si determina l'utente corrente
[Authorize]
public abstract class ApiControllerBase : ControllerBase
{
    //L'utente corrente, letto dal token già verificato
    //  il claim "sub" contiene il suo Id
    protected Guid GetCurrentUserId()
    {
        var subject = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? throw new InvalidOperationException("Token autenticato senza claim 'sub'.");

        return Guid.Parse(subject);
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

        var statusCode = error.Type switch
        {
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            _ => StatusCodes.Status500InternalServerError,
        };

        return Problem(detail: error.Message, statusCode: statusCode);
    }
}