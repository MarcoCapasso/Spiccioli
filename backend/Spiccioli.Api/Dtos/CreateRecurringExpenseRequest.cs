using System.ComponentModel.DataAnnotations;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Dtos;

//Ciò che il client invia per programmare una spesa che si ripete 
public record CreateRecurringExpenseRequest(
    [Required(ErrorMessage = "Il nome è obbligatorio.")]
    [StringLength(100, ErrorMessage = "Il nome non può superare i 100 caratteri.")]
    string Name,

    [Range(typeof(decimal), "0", "999999999", MinimumIsExclusive = true, ErrorMessage = "L'importo deve essere maggiore di 0.")]
    decimal Amount,

   [EnumDataType(typeof(RecurrenceFrequency), ErrorMessage = "La frequenza non è valida.")]
    RecurrenceFrequency Frequency,

    DateOnly StartDate,

    DateOnly? EndDate,

    [Range(1, int.MaxValue, ErrorMessage = "La categoria è obbligatoria.")]
    int CategoryId) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        foreach (var error in ValidationRules.RequiredDate(StartDate, field: nameof(StartDate)))
        {
            yield return error;
        }

        //La data di fine è facoltativa (spesa senza termine), ma se c'è non può precedere l'inizio
        foreach (var error in ValidationRules.DateRange(StartDate, EndDate, fromField: nameof(StartDate), toField: nameof(EndDate)))
        {
            yield return error;
        }
    }
};