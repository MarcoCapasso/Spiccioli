using System.ComponentModel.DataAnnotations;

namespace Spiccioli.Api.Dtos;

public record LoginRequest(
    [Required(ErrorMessage = "L'email è obbligatoria.")]
    string Email,

    [Required(ErrorMessage = "La password è obbligatoria.")]
    string Password
);