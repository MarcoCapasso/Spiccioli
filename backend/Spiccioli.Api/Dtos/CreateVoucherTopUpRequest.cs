using System.ComponentModel.DataAnnotations;

namespace Spiccioli.Api.Dtos;

//Ciò che il client invia per registrare una ricarica del credito
public record CreateVoucherTopUpRequest(
    DateOnly Date,

    [Range(typeof(decimal), "0", "999999", MinimumIsExclusive = true, ErrorMessage = "L'importo deve essere maggiore di zero.")]
    decimal Amount) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        => ValidationRules.RequiredDate(Date);
}
