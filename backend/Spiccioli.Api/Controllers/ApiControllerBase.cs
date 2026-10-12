using Microsoft.AspNetCore.Mvc;

namespace Spiccioli.Api.Controllers;

// Base comune dei Controller: un solo punto in cui si determina l'utente corrente
public abstract class ApiControllerBase : ControllerBase
{
    // TEMPORANEO fino alla Fase 9: utente di prova fisso, poi letto dal token JWT
    protected Guid GetCurrentUserId()
    {
        return Guid.Parse("11111111-1111-1111-1111-111111111111");
    }
}