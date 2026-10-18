using Spiccioli.Api.Common;
using Spiccioli.Api.Models;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Services;

public class CategoryValidator : ICategoryValidator
{
    private readonly ICategoryRepository _categories;

    public CategoryValidator(ICategoryRepository categories)
    {
        _categories = categories;
    }
    public async Task<Error?> ValidateAsync(Guid userId, int categoryId, TransactionType expectedType, string field)
    {
        var category = await _categories.GetByIdAsync(categoryId, userId);

        //Stesso messaggio se non esiste o è di un altro utente
        if (category is null)
        {
            return Error.Validation(field, "La categoria indicata non esiste.");
        }

        if (category.IsArchived)
        {
            return Error.Validation(field, "La categoria è archiviata: ripristinala o scegline un'altra.");
        }

        if (category.Type != expectedType)
        {
            return Error.Validation(field, "Il tipo della categoria non corrisponde al tipo di transazione.");
        }

        return null;
    }
}