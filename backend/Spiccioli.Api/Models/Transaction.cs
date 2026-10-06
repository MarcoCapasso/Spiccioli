namespace Spiccioli.Api.Models;

public class Transaction
{
    public int Id { get; set; }
    public string? Description { get; set; }

    //importo sempre positivo, il segno lo decide il Type
    public decimal Amount { get; set; }

    //Solo data, senza orario
    public DateOnly Date { get; set; }

    public TransactionType Type { get; set; }

    //Relazione con la categoria (chiave esterna + navigazione), null se la categoria viene eliminata; alla creazione è obbligatoria, controllato nel Service
    public int? CategoryId { get; set; }
    public Category? Category { get; set;}

    //Relazione con l'utente della transazione
    public Guid UserId { get; set; }
    public User? User { get; set; } 

    // Il pagamento previsto che questa transazione salda (null per le spese normali)
    public int? PlannedPaymentId { get; set; }
    public PlannedPayment? PlannedPayment { get; set; }
}