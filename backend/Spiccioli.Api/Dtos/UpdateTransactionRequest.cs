using System.ComponentModel.DataAnnotations;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Dtos;

//Ciò che il client invia per modificare una transazione
public record UpdateTransactionRequest(
    [Range(0, 999_999_999, MinimumIsExclusive = true, ErrorMessage = "L'importo deve essere maggiore di zero.")]
    decimal Amount,

    DateOnly Date,

    [EnumDataType(typeof(TransactionType), ErrorMessage = "Tipo non valido: usa Income o Expense.")]
    TransactionType Type,

    [Range(1, int.MaxValue, ErrorMessage = "La categoria è obbligatoria.")]
    int CategoryId,

    [StringLength(200, ErrorMessage = "La descrizione non può superare i 100 caratteri.")]
    string? Description,

    [StringLength(240, ErrorMessage = "La nota non può superare i 240 caratteri.")]
    string? Note = null) : IValidatableObject

{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        => ValidationRules.RequiredDate(Date);
}