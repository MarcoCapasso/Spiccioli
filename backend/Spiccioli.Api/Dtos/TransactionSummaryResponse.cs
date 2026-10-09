namespace Spiccioli.Api.Dtos;

//Totali del periodo richiesto
public record TransactionSummaryResponse(
    decimal TotalIncome,
    decimal TotalExpense)
{
    public decimal Balance => TotalIncome - TotalExpense;
}