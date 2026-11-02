namespace Spiccioli.Api.Models;

//Una ricarica del credito dei buoni pasto
public class VoucherTopUp
{
    public int Id { get; set; }

    //Solo data, senza orario
    public DateOnly Date { get; set; }

    //Euro caricati, sempre positivi
    public decimal Amount { get; set; }

    //Relazione con l'utente
    public Guid UserId { get; set; }
    public User? User { get; set; }
}
