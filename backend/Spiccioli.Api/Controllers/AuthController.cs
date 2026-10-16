using Microsoft.AspNetCore.Mvc;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Services;

namespace Spiccioli.Api.Controllers;

//Endpoint di registrazione e login: gli unici che non richiederanno un token
[ApiController]
[Route("api/auth")]
public class AuthController : ApiControllerBase
{
    private readonly IAuthService _service;

    public AuthController(IAuthService service)
    {
        _service = service;
    }

    // Registra un nuovo utente: 201 con il profilo, oppure 409 se l'email è già usata
    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<ActionResult<UserResponse>> Register(RegisterRequest request)
    {
        var result = await _service.RegisterAsync(request);
        if (!result.IsSuccess)
        {
            return ToProblem(result.Error!);
        }

        return StatusCode(StatusCodes.Status201Created, result.Value);
    }
}