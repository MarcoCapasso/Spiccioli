using System.ComponentModel.DataAnnotations;

namespace Spiccioli.Api.Dtos;

//Intervallo di date facoltativo letto da query string
public record DateRangeFilter(
    DateOnly? From,
    DateOnly? To)  : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        => ValidationRules.DateRange(From, To);
}