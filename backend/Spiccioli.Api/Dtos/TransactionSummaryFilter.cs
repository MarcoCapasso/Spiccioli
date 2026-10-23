using System.ComponentModel.DataAnnotations;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Dtos;

//Filtri facoltativi del riepilogo
public record TransactionSummaryFilter(
    DateOnly? From,
    DateOnly? To,
    int? CategoryId,

    [EnumDataType(typeof(TransactionType), ErrorMessage = "Tipo non valido: usa Income o Expense.")]
    TransactionType? Type = null,

    [StringLength(100, ErrorMessage = "La ricerca non può superare i 100 caratteri.")]
    string? Search = null) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        => ValidationRules.DateRange(From, To);
}