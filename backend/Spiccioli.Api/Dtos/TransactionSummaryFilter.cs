using System.ComponentModel.DataAnnotations;
namespace Spiccioli.Api.Dtos;

//Filtri facoltativi del riepilogo
public record TransactionSummaryFilter(
    DateOnly? From,
    DateOnly? To,
    int? CategoryId) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        => ValidationRules.DateRange(From, To);
}