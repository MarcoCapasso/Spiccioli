using System.ComponentModel.DataAnnotations;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Dtos;

public record CreateCategoryRequest(
    [Required(ErrorMessage = "Il nome della categoria è obbligatorio.")]
    [StringLength(50, ErrorMessage = "Il nome non può superare i 50 caratteri.")]
    string Name,

    [EnumDataType(typeof(TransactionType), ErrorMessage = "Tipo non valido: usa Income o Expense.")]
    TransactionType Type
);