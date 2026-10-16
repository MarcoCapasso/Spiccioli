using System.ComponentModel.DataAnnotations;

namespace Spiccioli.Api.Dtos;

public record RegisterRequest(
    [Required(ErrorMessage = "Il nome è obbligatorio.")]
    [StringLength(100, ErrorMessage = "Il nome non può superare i 100 caratteri.")]
    string FirstName,

    [StringLength(100, ErrorMessage = "Il cognome non può superare i 100 caratteri.")]
    string? LastName,

    [Required(ErrorMessage = "L'email è obbligatoria.")]
    [EmailAddress(ErrorMessage = "L'email non è valida.")]
    [StringLength(256, ErrorMessage = "L'email non può superare i 256 caratteri.")]
    string Email,

    [Required(ErrorMessage = "La password è obbligatoria.")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "La password deve avere tra 8 e 100 caratteri.")]
    string Password);