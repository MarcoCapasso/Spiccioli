namespace Spiccioli.Api.Dtos;

//Una scadenza del mese
public record ScheduledPaymentResponse(
    int RecurringExpenseId,

    //Null se il piano del mese non è stato aperto
    //  senza piano non c'è nulla da saldare
    int? PlannedPaymentId,

    string Name,
    decimal Amount,
    DateOnly DueDate,
    int CategoryId,
    string? CategoryName,
    bool IsPaid,
    //Importo e data del pagamento vero se saldata
    //  possono differire da quelli previsti
    decimal? PaidAmount,

    DateOnly? PaidDate,

    //Non saldata e con la data già passata
    bool IsOverdue);