using System.ComponentModel.DataAnnotations;
using Spiccioli.Api.Common;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Dtos;

public record CreateCategoryRequest(
    [Required(ErrorMessage = "Il nome della categoria è obbligatorio.")]
    [StringLength(50, ErrorMessage = "Il nome non può superare i 50 caratteri.")]
    string Name,

    [EnumDataType(typeof(TransactionType), ErrorMessage = "Tipo non valido: usa Income o Expense.")]
    TransactionType Type,

    //Facoltativo: se manca, il Service sceglie il prossimo colore della tavolozza
    string? Color = null) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Color is not null && !CategoryPalette.Contains(Color))
        {
            yield return new ValidationResult(
                "Colore non valido: scegli uno della tavolozza.", [nameof(Color)]);
        }
    }
}