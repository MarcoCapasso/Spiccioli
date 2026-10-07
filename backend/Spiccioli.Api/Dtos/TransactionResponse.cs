using Spiccioli.Api.Models;

namespace Spiccioli.Api.Dtos;

//Ciò che il client riceve per ogni transazione
public record TransactionResponse(
    int Id,
    decimal Amount,
    DateOnly Date,
    TransactionType Type,
    string? Description,
    int? CategoryId,
    string? CategoryName);