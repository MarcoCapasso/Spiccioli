using System.ComponentModel.DataAnnotations;

namespace Spiccioli.Api.Dtos;

//Regole di forma per i DTO
public static class ValidationRules
{

    //Data di inizio successiva alla data di fine
    public static IEnumerable<ValidationResult> DateRange(
        DateOnly? from, DateOnly? to, string fromField = "From", string toField = "To")
    {
        if (from is not null && to is not null && from > to)
        {
            yield return new ValidationResult("La data di inizio non può essere successiva alla data di fine.", new[] { fromField, toField });
        }
    }

    //Inserimento data obbligatorio
    public static IEnumerable<ValidationResult> RequiredDate(DateOnly date, string field ="Date")
    {
        if (date == default)
        {
            yield return new ValidationResult("La data è obbligatoria", new[] { field });
        }
    }
}

