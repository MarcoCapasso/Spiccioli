namespace Spiccioli.Api.Dtos;

//Il piano di un mese, con le voci di spesa per categoria e i pagamenti previsti
public record MonthlyBudgetResponse(
    int Id,
    int Year,
    int Month,
    decimal PlannedIncome,
    decimal SavingsTarget,
    IReadOnlyList<BudgetAllocationResponse> Allocations,
    IReadOnlyList<PlannedPaymentResponse> PlannedPayments);