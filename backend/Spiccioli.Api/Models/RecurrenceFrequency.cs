namespace Spiccioli.Api.Models;

//Frequenza di una spesa ricorrente, ogni valore è il numero di mesi tra due scadenze
public enum RecurrenceFrequency
{
    Monthly = 1,     // Mensile
    Bimonthly = 2,   // Bimestrale
    Quarterly = 3,   // Trimestrale
    SemiAnnual = 6,  // Semestrale
    Annual = 12      // Annuale
}