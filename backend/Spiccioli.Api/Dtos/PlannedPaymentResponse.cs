namespace Spiccioli.Api.Dtos;

//Una scadenza del mese: nome, importo e data sono copiati dalla spesa ricorrente al momento della creazione
public record PlannedPaymentResponse(
    int Id,
    string Name,
    decimal Amount,
    DateOnly DueDate,
    bool IsPaid,
    int RecurringExpenseId
);