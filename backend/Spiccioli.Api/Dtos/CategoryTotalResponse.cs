using Spiccioli.Api.Models;

namespace Spiccioli.Api.Dtos;

//Totale e numero di movimenti di una categoria nel periodo
public record CategoryTotalResponse(
    int? CategoryId,
    string? CategoryName,
    TransactionType Type,
    decimal Total,
    int Count
);