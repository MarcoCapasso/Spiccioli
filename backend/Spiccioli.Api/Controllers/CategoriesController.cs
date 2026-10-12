using Microsoft.AspNetCore.Mvc;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Services;

namespace Spiccioli.Api.Controllers;

//Endpoint HTTP delle categorie
[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ApiControllerBase
{
    private readonly ICategoryService _service;

    public CategoriesController(ICategoryService service)
    {
        _service = service;
    }

    // GET /api/categories/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryResponse>> GetById(int id)
    {
        var category = await _service.GetByIdAsync(GetCurrentUserId(), id);

        return category is null ? NotFound() : Ok(category);   
    }

    //Categorie dell'utente in ordine alfabetico; le archiviate solo con includeArchived=true
    // GET /api/categories?includeArchived={true|false}
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryResponse>>> GetAll(
        [FromQuery] bool includeArchived = false)
    {
        var categories = await _service.GetByUserAsync(GetCurrentUserId(), includeArchived);
        return Ok(categories);
    }

    // POST /api/categories
    [HttpPost]
    public async Task<ActionResult<CategoryResponse>> Create(CreateCategoryRequest request)
    {
        var created = await _service.CreateAsync(GetCurrentUserId(), request);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT /api/categories/{id}
    [HttpPut("{id:int}")]
    public async Task<ActionResult<CategoryResponse>> Rename(int id, UpdateCategoryRequest request)
    {
        var renamed = await _service.RenameAsync(GetCurrentUserId(), id, request);
        return renamed is null ? NotFound() : Ok(renamed);
    }

    // DELETE /api/categories/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(GetCurrentUserId(), id);
        return deleted ? NoContent() : NotFound();
    }

    // Riattiva una categoria archiviata, con tutta la sua storia; oppure 404
    // POST /api/categories/{id}/restore
    [HttpPost("{id:int}/restore")]
    public async Task<ActionResult<CategoryResponse>> Restore(int id)
    {
        var restored = await _service.RestoreAsync(GetCurrentUserId(), id);
        return restored is null ? NotFound() : Ok(restored);
    }

}