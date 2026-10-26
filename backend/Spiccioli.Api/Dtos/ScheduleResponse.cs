namespace Spiccioli.Api.Dtos;

//Le scadenze di un mese, con i totali già calcolati
public record ScheduleResponse(
    int Year,
    int Month,

    //False se il piano del mese non è stato aperto
    bool BudgetOpen,
    IReadOnlyList<ScheduledPaymentResponse> Payments,

    //Somma degli importi previsti di tutte le scadenze
    decimal PlannedTotal,

    //Somma degli importi realmente pagati
    decimal PaidTotal,
    
    //Somma degli importi previsti delle scadenze non ancora saldate
    decimal PendingTotal);