using System.ComponentModel.DataAnnotations;
using Spiccioli.Api.Common;

namespace Spiccioli.Api.Dtos;

//Nome e colore; il tipo si decide alla creazione e non cambia più
public record UpdateCategoryRequest(
    [Required(ErrorMessage = "Il nome della categoria è obbligatorio.")]
    [StringLength(50, ErrorMessage = "Il nome non può superare i 50 caratteri.")]
    string Name,

    //Facoltativo: se manca, il colore non cambia
    string? Color = null) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Color is not null && !CategoryPalette.IsValidColor(Color))
        {
            yield return new ValidationResult(
                "Colore non valido: usa il formato #RRGGBB.", [nameof(Color)]);
        }
    }
}