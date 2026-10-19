using System.ComponentModel.DataAnnotations;

namespace Spiccioli.Api.Dtos;

//Ciò che l'utente conferma premendo "Pagato": importo e data reali, che possono differire dal previsto
public record PayPlannedPaymentRequest(
    [Range(typeof(decimal), "0", "999999999", MinimumIsExclusive = true,
        ErrorMessage = "L'importo pagato deve essere maggiore di zero.")]
    decimal Amount,

    DateOnly Date) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        foreach (var error in ValidationRules.RequiredDate(Date))
        {
            yield return error;
        }
    }
}