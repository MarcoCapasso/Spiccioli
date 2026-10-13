using Spiccioli.Api.Dtos;

namespace Spiccioli.Api.Tests.Dtos;

//Test delle regole di forma
public class ValidationRulesTests
{
    [Fact]
    public void DateRange_FromAfterTo_ReturnsOneErrors()
    {
        //Arrange
        var from = new DateOnly(2026, 10, 31);
        var to = new DateOnly(2026, 10, 1);

        //Act
        var errors = ValidationRules.DateRange(from, to).ToList();

        //Assert
        Assert.Single(errors);
    }

    [Fact]
    public void DateRange_FromBeforeTo_ReturnsNoErrors()
    {
        //Arrange
        var from = new DateOnly(2026, 10, 1);
        var to = new DateOnly(2026, 10, 31);

        //Act
        var errors = ValidationRules.DateRange(from, to).ToList();

        //Assert
        Assert.Empty(errors);
    }

    [Fact]
    public void DateRange_OnlyFrom_ReturnsNoErrors()
    {
        //Arrange
        var from = new DateOnly(2026, 10, 1);
        DateOnly? to = null;

        //Act
        var errors = ValidationRules.DateRange(from, to).ToList();

        //Assert
        Assert.Empty(errors);
    }

    [Fact]
    public void RequiredDate_DefaultDate_ReturnsOneErrors()
    {
        //Arrange
        DateOnly date = default;

        //Act
        var errors = ValidationRules.RequiredDate(date).ToList();

        //Assert
        Assert.Single(errors);
    }

    [Fact]
    public void DateRange_SameDay_ReturnsNoErrors()
    {
        //Arrange
        var from = new DateOnly(2026, 10, 1);
        var to = new DateOnly(2026, 10, 1);

        //Act
        var errors = ValidationRules.DateRange(from, to).ToList();

        //Assert
        Assert.Empty(errors);
    }
}