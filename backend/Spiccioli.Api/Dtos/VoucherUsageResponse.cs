namespace Spiccioli.Api.Dtos;

//Ciò che il client riceve su un uso dei buoni
public record VoucherUsageResponse(
    int Id,
    DateOnly Date,
    int Count,

    //Il valore di un buono quando è stato usato
    decimal UnitValue,

    //Euro scalati dal credito: Count per UnitValue
    decimal Total,

    string? Note);
