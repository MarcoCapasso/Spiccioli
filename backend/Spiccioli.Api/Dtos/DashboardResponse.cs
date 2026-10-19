namespace Spiccioli.Api.Dtos;

//Il riepilogo del mese: previsto, reale, categorie e scadenze ancora da pagare
public record DashboardResponse(
    int Year,
    int Month,
    decimal PlannedIncome,
    decimal SavingsTarget,
    decimal TotalAllocated,
    decimal ActualIncome,
    decimal ActualExpense,
    decimal PendingPaymentsTotal,
    int PendingPaymentsCount,
    IReadOnlyList<CategoryProgressResponse> Categories)
{
    //Quanto resta da assegnare alle categorie: negativo se si è pianificato oltre il disponibile (regola 5)
    public decimal Unallocated => PlannedIncome - SavingsTarget - TotalAllocated;

    //Il risparmio reale del mese, da confrontare con SavingsTarget
    public decimal ActualSavings => ActualIncome - ActualExpense;
}