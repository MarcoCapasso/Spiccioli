using System.ComponentModel.DataAnnotations;

namespace Spiccioli.Api.Dtos;

//Ciò che il client invia per impostare il valore di un buono
public record UpdateVoucherSettingsRequest(
    [Range(typeof(decimal), "0", "1000", MinimumIsExclusive = true, ErrorMessage = "Il valore del buono deve essere maggiore di zero.")]
    decimal Value);
