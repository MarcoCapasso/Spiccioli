using System.ComponentModel.DataAnnotations;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Dtos;

//Filtri facoltativi dell'elenco transazioni
public record TransactionFilter(
    DateOnly? From,
    DateOnly? To,
    int? CategoryId,

    [Range(1, 999_999_999, ErrorMessage = "La pagina deve essere maggiore di zero.")]
    int? Page,

    [Range(1, 100, ErrorMessage = "La dimensione della pagina deve essere tra 1 e 100.")]
    int? PageSize,

    [EnumDataType(typeof(TransactionType), ErrorMessage = "Tipo non valido: usa Income o Expense.")]
    TransactionType? Type = null,

    [StringLength(100, ErrorMessage = "La ricerca non può superare i 100 caratteri.")]
    string? Search = null) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        => ValidationRules.DateRange(From, To);
}