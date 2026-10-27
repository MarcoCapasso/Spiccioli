using System.ComponentModel.DataAnnotations;

namespace Spiccioli.Api.Dtos;

//Il nome che l'utente vuole vedere nell'app
public record UpdateProfileRequest(
    [Required(ErrorMessage = "Inserisci un nome.")]
    [StringLength(100, ErrorMessage = "Il nome può avere al massimo 100 caratteri.")]
    string FirstName
);