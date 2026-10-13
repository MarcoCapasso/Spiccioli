using System.ComponentModel.DataAnnotations;

namespace Spiccioli.Api.Dtos;

//Regole di forma per i DTO
public static class ValidationRules
{

    //Data di inizio successiva alla data di fine
    public static IEnumerable<ValidationResult> DateRange(DateOnly? from, DateOnly? to)
    {
        if (from is not null && to is not null && from > to)
        {
            yield return new ValidationResult(
                "La data di inizio non può essere successiva alla data di fine.", new[] {"From", "To"}
            );
        }
    }

    //Inserimento data obbligatorio
    public static IEnumerable<ValidationResult> RequiredDate(DateOnly date)
    {
        if (date == default)
        {
            yield return new ValidationResult("La data è obbligatoria", new[] {"Date"});
        }
    }
}

