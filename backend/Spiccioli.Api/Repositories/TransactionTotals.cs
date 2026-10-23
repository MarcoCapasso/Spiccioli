namespace Spiccioli.Api.Repositories;

//Somme e conteggi di entrate e uscite nel periodo
public record TransactionTotals(decimal TotalIncome, decimal TotalExpense, int IncomeCount, int ExpenseCount);