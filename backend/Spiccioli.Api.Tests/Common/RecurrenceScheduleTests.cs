using System.Globalization;
using Spiccioli.Api.Common;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Tests.Common;

//Test del calcolo delle scadenze: ogni riga è un caso, scritto prima del codice
public class RecurrenceScheduleTests
{
    [Theory]
    //Il giorno della data di inizio
    [InlineData("2026-01-15", null, RecurrenceFrequency.Monthly, 2026, 10, "2026-10-15")]
    [InlineData("2026-01-31", null, RecurrenceFrequency.Monthly, 2026, 1, "2026-01-31")]

    //Mesi più corti: l'ultimo giorno del mese, poi si torna al giorno originale
    [InlineData("2026-01-31", null, RecurrenceFrequency.Monthly, 2026, 2, "2026-02-28")]
    [InlineData("2026-01-31", null, RecurrenceFrequency.Monthly, 2028, 2, "2028-02-29")]
    [InlineData("2026-01-31", null, RecurrenceFrequency.Monthly, 2026, 4, "2026-04-30")]
    [InlineData("2026-01-31", null, RecurrenceFrequency.Monthly, 2026, 3, "2026-03-31")]

    //Caso limite il 29 febbraio: negli anni non bisestili diventa il 28
    [InlineData("2028-02-29", null, RecurrenceFrequency.Annual, 2029, 2, "2029-02-28")]
    [InlineData("2028-02-29", null, RecurrenceFrequency.Annual, 2032, 2, "2032-02-29")]
    
    //Prima dell'inizio: nessuna scadenza
    [InlineData("2026-06-01", null, RecurrenceFrequency.Monthly, 2026, 5, null)]

    //Le frequenze: per ognuna, un mese in cui scade e uno in cui non scade
    [InlineData("2026-01-31", null, RecurrenceFrequency.Bimonthly, 2026, 3, "2026-03-31")]
    [InlineData("2026-01-31", null, RecurrenceFrequency.Bimonthly, 2026, 4, null)]
    [InlineData("2026-01-31", null, RecurrenceFrequency.Bimonthly, 2026, 9, "2026-09-30")]
    [InlineData("2025-11-10", null, RecurrenceFrequency.Quarterly, 2026, 2, "2026-02-10")]
    [InlineData("2025-11-10", null, RecurrenceFrequency.Quarterly, 2026, 3, null)]
    [InlineData("2026-01-31", null, RecurrenceFrequency.SemiAnnual, 2026, 7, "2026-07-31")]
    [InlineData("2026-01-31", null, RecurrenceFrequency.SemiAnnual, 2026, 6, null)]
    [InlineData("2025-03-05", null, RecurrenceFrequency.Annual, 2026, 3, "2026-03-05")]
    [InlineData("2025-03-05", null, RecurrenceFrequency.Annual, 2026, 4, null)]
    
    //La data di fine
    [InlineData("2026-01-10", "2026-08-31", RecurrenceFrequency.Monthly, 2026, 8, "2026-08-10")]
    [InlineData("2026-01-10", "2026-08-31", RecurrenceFrequency.Monthly, 2026, 9, null)]
    [InlineData("2026-01-20", "2026-05-15", RecurrenceFrequency.Monthly, 2026, 5, null)]
    
    //Spesa singola programmata: inizio e fine uguali, la scadenza nel giorno di fine è valida
    [InlineData("2026-03-10", "2026-03-10", RecurrenceFrequency.Monthly, 2026, 3, "2026-03-10")]
    [InlineData("2026-03-10", "2026-03-10", RecurrenceFrequency.Monthly, 2026, 4, null)]
    public void GetDueDate_ReturnsExpectedDate(
        string start, string? end, RecurrenceFrequency frequency, int year, int month, string? expected)
    {
        // Arrange
        var startDate = Parse(start);
        DateOnly? endDate = end is null ? null : Parse(end);
        DateOnly? expectedDate = expected is null ? null : Parse(expected);

        // Act
        var dueDate = RecurrenceSchedule.GetDueDate(startDate, endDate, frequency, year, month);

        // Assert
        Assert.Equal(expectedDate, dueDate);
    }

    private static DateOnly Parse(string date) => DateOnly.Parse(date, CultureInfo.InvariantCulture);
}