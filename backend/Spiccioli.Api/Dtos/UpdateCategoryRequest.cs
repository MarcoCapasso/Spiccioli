using System.ComponentModel.DataAnnotations;
namespace Spiccioli.Api.Dtos;

//solo il nome, il tipo si decide alla creazione e non cambia più
public record UpdateCategoryRequest(
    [Required(ErrorMessage = "Il nome della categoria è obbligatorio.")]
    [StringLength(50, ErrorMessage = "Il nome non può superare i 50 caratteri.")]
    string Name
);