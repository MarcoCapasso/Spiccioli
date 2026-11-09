using Spiccioli.Api.Common;

namespace Spiccioli.Api.Models;

public class Category
{
    public int Id { get; set; }

    //Nel database è cifrato: qui è sempre in chiaro
    public string Name { get; set; } = string.Empty;

    //Impronta del nome (senza maiuscole), calcolata da AppDbContext a ogni salvataggio:
    //il nome è cifrato, quindi il database non può confrontarlo. Serve per trovare i duplicati. Null solo per i dati precedenti alla cifratura
    public string? NameKey { get; set; }

    //Uno dei colori della tavolozza, in formato #RRGGBB maiuscolo
    public string Color { get; set; } = CategoryPalette.Default;

    //Anche se elimino una categoria, questa non apparirà più nelle transazioni future, ma resta nello storico
    public bool IsArchived { get; set; }

    //Relazione con User
    public Guid UserId { get; set; }
    public User? User { get; set; }

    //Indica il tipo della categoria, se entrata o uscita, gestito dal Service
    public TransactionType Type { get; set; }
}
