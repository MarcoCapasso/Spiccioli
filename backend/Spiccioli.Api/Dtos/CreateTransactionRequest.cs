using Spiccioli.Api.Models;

namespace Spiccioli.Api.Dtos;

//Ciò che il client invia per creare una transazione
public record CreateTransactionRequest(
    decimal Amount,
    DateOnly Date,
    TransactionType Type,
    int CategoryId,
    string? Description
);