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
    string? CategoryName,
    string? Note = null)
{
    //Unico punto di conversione dal modello, utilizzato da tutti i service
    public static TransactionResponse FromTransaction(Transaction transaction) =>
        new(
            transaction.Id,
            transaction.Amount,
            transaction.Date,
            transaction.Type,
            transaction.Description,
            transaction.CategoryId,
            transaction.Category?.Name,
            transaction.Note
        );
}