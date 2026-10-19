using System.ComponentModel.DataAnnotations;

namespace Spiccioli.Api.Dtos;

//La cifra prevista per una categoria nel piano; la categoria arriva dall'indirizzo
public record SetAllocationRequest(
    [Range(typeof(decimal), "0", "999999999", ErrorMessage = "La cifra prevista non può essere negativa.")]
    decimal Amount
);