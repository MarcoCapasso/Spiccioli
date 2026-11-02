using System.ComponentModel.DataAnnotations;

namespace Spiccioli.Api.Dtos;

//Ciò che il client invia per registrare un uso dei buoni
public record CreateVoucherUsageRequest(
    DateOnly Date,

    [Range(1, 1000, ErrorMessage = "Il numero di buoni deve essere almeno 1.")]
    int Count,

    [StringLength(240, ErrorMessage = "La nota non può superare i 240 caratteri.")]
    string? Note = null) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        => ValidationRules.RequiredDate(Date);
}
