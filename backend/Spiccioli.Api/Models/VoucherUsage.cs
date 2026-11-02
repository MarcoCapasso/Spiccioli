namespace Spiccioli.Api.Models;

//Un uso dei buoni pasto: quanti buoni hai speso in un certo giorno
public class VoucherUsage
{
    public int Id { get; set; }

    //Solo data, senza orario
    public DateOnly Date { get; set; }

    //Numero di buoni usati
    public int Count { get; set; }

    //Il valore di un buono nel momento dell'uso, così il passato non cambia se il valore cambia
    public decimal UnitValue { get; set; }

    //Dettaglio facoltativo
    public string? Note { get; set; }

    //Relazione con l'utente
    public Guid UserId { get; set; }
    public User? User { get; set; }
}
