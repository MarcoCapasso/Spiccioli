using System.ComponentModel.DataAnnotations;

namespace Spiccioli.Api.Dtos;

//Le categorie predefinite scelte dall'utente al primo accesso
public record CompleteOnboardingRequest(
    [Required(ErrorMessage = "Scegli almeno una categoria.")]
    [MinLength(1, ErrorMessage = "Scegli almeno una categoria.")]
    IReadOnlyList<string> CategoryNames
);