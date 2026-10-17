using Microsoft.AspNetCore.Mvc;
using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Services;

namespace Spiccioli.Api.Controllers;

//l'identità arriva sempre dal token, mai dall'URL
[ApiController]
[Route("api/me")]
public class ProfileController : ApiControllerBase
{
    private readonly IProfileService _service;

    public ProfileController(IProfileService service)
    {
        _service = service;
    }

    //Il profilo dell'utente, con l'indicazione se ha completato l'onboarding
    // GET /api/me
    [HttpGet]
    public async Task<ActionResult<UserResponse>> Get()
    {
        var result = await _service.GetAsync(GetCurrentUserId());
        if (!result.IsSuccess)
        {
            return ToProblem(result.Error!);
        }

        return Ok(result.Value);
    }

    //Le categorie proposte nell'onboarding: un elenco fisso, senza logica né database
    // GET /api/me/default-categories
    [HttpGet("default-categories")]
    public ActionResult<IReadOnlyList<DefaultCategory>> GetDefaultCategories()
    {
        return Ok(DefaultCategories.All);
    }
}