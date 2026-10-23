namespace Spiccioli.Api.Dtos;

//Totali e conteggi del periodo richiesto
public record TransactionSummaryResponse(
    decimal TotalIncome,
    decimal TotalExpense,
    int IncomeCount,
    int ExpenseCount)
{
    public decimal Balance => TotalIncome - TotalExpense;
}