using Spiccioli.Api.Models;

namespace Spiccioli.Api.Dtos;

//Ciò che il client invia per modificare una transazione
public record UpdateTransactionRequest(
    decimal Amount,
    DateOnly Date,
    TransactionType Type,
    int CategoryId,
    string? Description
);