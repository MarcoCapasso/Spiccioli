using System.ComponentModel.DataAnnotations;

namespace Spiccioli.Api.Dtos;

//Filtri facoltativi dell'elenco transazioni, letti dalla query
public record TransactionFilter(
    DateOnly? From,
    DateOnly? To,
    int? CategoryId,

    [Range(1, 999_999_999, ErrorMessage = "La pagina deve essere maggiore di zero.")]
    int? Page,

    [Range(1, 100, ErrorMessage = "La dimensione della pagina deve essere tra 1 e 100.")]
    int? PageSize) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        => ValidationRules.DateRange(From, To);
}