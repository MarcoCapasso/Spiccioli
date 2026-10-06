namespace Spiccioli.Api.Models;

public class RecurringExpense
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public RecurrenceFrequency Frequency { get; set; }

    // Prima scadenza: le successive si calcolano da qui (la prossima scadenza non si salva, è un dato derivato)
    public DateOnly StartDate { get; set; }

    //Fine delle rate o disdetta abbonamento, "null" se si rinnova all'infinito
    public DateOnly? EndDate { get; set; }
    
    //Relazione con la categoria
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
    
    //Relazione con l'utente
    public Guid UserId { get; set; }
    public User? User { get; set; }
}