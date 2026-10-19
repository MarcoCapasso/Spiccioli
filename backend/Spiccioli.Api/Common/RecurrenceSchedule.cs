using Spiccioli.Api.Models;

namespace Spiccioli.Api.Common;

//Calcolo delle scadenze delle spese ricorrenti
public static class RecurrenceSchedule
{
    //Il giorno in cui la spesa scade nel mese indicato
    public static DateOnly? GetDueDate(
        DateOnly startDate, DateOnly? endDate, RecurrenceFrequency frequency, int year, int month)
    {
        // Quanti mesi sono passati dal mese di inizio a quello richiesto
        var monthsSinceStart = (year - startDate.Year) * 12 + (month - startDate.Month);

        //Prima dell'inizio, o in un mese che non è un multiplo della frequenza: nessuna scadenza
        if (monthsSinceStart < 0 || monthsSinceStart % (int)frequency != 0)
        {
            return null;
        }

        // Il giorno della data di inizio, ma mai oltre l'ultimo giorno del mese (31 gennaio → 28 febbraio)
        var day = Math.Min(startDate.Day, DateTime.DaysInMonth(year, month));
        var dueDate = new DateOnly(year, month, day);

        // Una scadenza che cadrebbe dopo la data di fine non esiste
        if (endDate is not null && dueDate > endDate)
        {
            return null;
        }

        return dueDate;
    }
}