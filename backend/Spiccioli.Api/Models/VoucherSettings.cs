namespace Spiccioli.Api.Models;

//Le impostazioni dei buoni pasto di un utente: una riga sola per utente
public class VoucherSettings
{
    //La chiave primaria è l'utente stesso: ogni utente ha al massimo un valore del buono
    public Guid UserId { get; set; }
    public User? User { get; set; }

    //Il valore di un singolo buono, in euro (5, 7, 8 o personalizzato)
    public decimal Value { get; set; }
}
