namespace Spiccioli.Api.Dtos;

//Ciò che il client riceve su una ricarica
public record VoucherTopUpResponse(
    int Id,
    DateOnly Date,
    decimal Amount);
