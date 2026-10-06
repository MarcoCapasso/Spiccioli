namespace Spiccioli.Api.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    //Anche se elimino una categoria, questa non apparirà più nelle transazioni future, ma resta nello storico
    public bool IsArchived { get; set; }

    //Relazione con User
    public Guid UserId { get; set; }
    public User? User { get; set; }

    //Indica il tipo della categoria, se entrata o uscita, gestito dal Service
    public TransactionType Type { get; set; }
}