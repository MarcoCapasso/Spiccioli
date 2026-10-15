using System.Globalization;
using Spiccioli.Api.Dtos;

namespace Spiccioli.Api.Tests.Dtos;

//Test delle regole di forma
public class ValidationRulesTests
{
    [Theory]
    [InlineData("2026-10-01", "2026-10-31", 0)] // intervallo corretto
    [InlineData("2026-10-31", "2026-10-01", 1)] // intervallo rovesciato
    [InlineData("2026-10-01", "2026-10-01", 0)] // stesso giorno
    [InlineData("2026-10-01", null, 0)]         // aperto a destra
    [InlineData(null, "2026-10-31", 0)]         // aperto a sinistra
    [InlineData(null, null, 0)]                 // nessun estremo

    public void DateRange_ReturnsExpectedErrorCount(string? from, string? to, int expectedErrors)
    {
        //Arrange
        DateOnly? fromDate = from is null ? null : DateOnly.Parse(from, CultureInfo.InvariantCulture);
        DateOnly? toDate = to is null ? null : DateOnly.Parse(to, CultureInfo.InvariantCulture);

        //Act
        var errors = ValidationRules.DateRange(fromDate, toDate).ToList();

        //Assert
        Assert.Equal(expectedErrors, errors.Count);
    }
    
    [Theory]
    [InlineData("0001-01-01", 1)] //il valore predefinito: campo non inviato
    [InlineData("2026-10-15", 0)] //una data normale
    public void RequiredDate_ReturnsExpectedErrorCount(string date, int expectedErrors)
    {
        //Arrange
        var parsedDate = DateOnly.Parse(date, CultureInfo.InvariantCulture);

        //Act
        var errors = ValidationRules.RequiredDate(parsedDate).ToList();

        //Assert
        Assert.Equal(expectedErrors, errors.Count);
    }

}