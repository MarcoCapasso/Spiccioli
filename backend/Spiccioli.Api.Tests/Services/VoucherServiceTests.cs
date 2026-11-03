using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Models;
using Spiccioli.Api.Services;
using Spiccioli.Api.Tests.Fakes;

namespace Spiccioli.Api.Tests.Services;

//Test dei buoni pasto di VoucherService, con Repository finto
public class VoucherServiceTests
{
    private static readonly Guid UserId = Guid.NewGuid();
    private static readonly DateOnly Today = new(2026, 11, 2);

    private readonly FakeVoucherRepository _repository = new();
    private readonly VoucherService _service;

    public VoucherServiceTests()
    {
        _service = new VoucherService(_repository);
    }

    //Imposta il valore del buono dell'utente nel finto database
    private void SetValue(decimal value, Guid? userId = null)
    {
        _repository.Settings.Add(new VoucherSettings { UserId = userId ?? UserId, Value = value });
    }

    [Fact]
    public async Task GetSummaryAsync_NothingSetYet_ReturnsZeros()
    {
        //Act
        var summary = await _service.GetSummaryAsync(UserId);

        //Assert
        Assert.Null(summary.UnitValue);
        Assert.Equal(0m, summary.Balance);
        Assert.Equal(0, summary.RemainingVouchers);
    }

    [Fact]
    public async Task GetSummaryAsync_WithTopUpsAndUsages_ComputesBalanceAndRemainingVouchers()
    {
        //Arrange: 160 euro caricati, 2 buoni da 8 usati
        SetValue(8m);
        await _service.AddTopUpAsync(UserId, new CreateVoucherTopUpRequest(Today, 160m));
        await _service.AddUsageAsync(UserId, new CreateVoucherUsageRequest(Today, 2));

        //Act
        var summary = await _service.GetSummaryAsync(UserId);

        //Assert: 160 - 16 = 144 euro, cioè 18 buoni da 8
        Assert.Equal(8m, summary.UnitValue);
        Assert.Equal(160m, summary.TotalTopUps);
        Assert.Equal(16m, summary.TotalUsed);
        Assert.Equal(144m, summary.Balance);
        Assert.Equal(18, summary.RemainingVouchers);
    }

    [Fact]
    public async Task GetSummaryAsync_ValueChangedAfterUsage_PastUsagesKeepTheirValue()
    {
        //Arrange: 2 buoni usati quando il buono valeva 8, poi il valore passa a 7
        SetValue(8m);
        await _service.AddTopUpAsync(UserId, new CreateVoucherTopUpRequest(Today, 160m));
        await _service.AddUsageAsync(UserId, new CreateVoucherUsageRequest(Today, 2));
        await _service.SetValueAsync(UserId, new UpdateVoucherSettingsRequest(7m));

        //Act
        var summary = await _service.GetSummaryAsync(UserId);

        //Assert: l'uso passato vale ancora 16 euro; 144 euro sono 20 buoni da 7 (con resto)
        Assert.Equal(144m, summary.Balance);
        Assert.Equal(7m, summary.UnitValue);
        Assert.Equal(20, summary.RemainingVouchers);
    }

    [Fact]
    public async Task SetValueAsync_CalledTwice_KeepsASingleRow()
    {
        //Act
        await _service.SetValueAsync(UserId, new UpdateVoucherSettingsRequest(5m));
        var summary = await _service.SetValueAsync(UserId, new UpdateVoucherSettingsRequest(7.5m));

        //Assert
        Assert.Single(_repository.Settings);
        Assert.Equal(7.5m, summary.UnitValue);
    }

    [Fact]
    public async Task AddUsageAsync_ValueNotSet_FailsWithValidation()
    {
        //Arrange
        await _service.AddTopUpAsync(UserId, new CreateVoucherTopUpRequest(Today, 100m));

        //Act
        var result = await _service.AddUsageAsync(UserId, new CreateVoucherUsageRequest(Today, 1));

        //Assert
        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.Validation, result.Error!.Type);
        Assert.Empty(_repository.Usages);
    }

    [Fact]
    public async Task AddUsageAsync_CreditNotEnough_FailsAndKeepsBalance()
    {
        //Arrange: 20 euro bastano per 2 buoni da 8, non per 3
        SetValue(8m);
        await _service.AddTopUpAsync(UserId, new CreateVoucherTopUpRequest(Today, 20m));

        //Act
        var result = await _service.AddUsageAsync(UserId, new CreateVoucherUsageRequest(Today, 3));

        //Assert
        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.Validation, result.Error!.Type);
        Assert.Equal("Count", result.Error.Field);
        Assert.Contains("2", result.Error.Message);
        Assert.Empty(_repository.Usages);
    }

    [Fact]
    public async Task AddUsageAsync_UsesAllTheCredit_Succeeds()
    {
        //Arrange
        SetValue(8m);
        await _service.AddTopUpAsync(UserId, new CreateVoucherTopUpRequest(Today, 16m));

        //Act
        var result = await _service.AddUsageAsync(UserId, new CreateVoucherUsageRequest(Today, 2));

        //Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(0m, (await _service.GetSummaryAsync(UserId)).Balance);
    }

    [Fact]
    public async Task AddUsageAsync_SavesTheValueOfTheMoment()
    {
        //Arrange
        SetValue(7m);
        await _service.AddTopUpAsync(UserId, new CreateVoucherTopUpRequest(Today, 100m));

        //Act
        var result = await _service.AddUsageAsync(UserId, new CreateVoucherUsageRequest(Today, 3, "  Pranzo  "));

        //Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(7m, result.Value!.UnitValue);
        Assert.Equal(21m, result.Value.Total);
        Assert.Equal("Pranzo", result.Value.Note);
        Assert.Equal(7m, Assert.Single(_repository.Usages).UnitValue);
    }

    [Fact]
    public async Task DeleteUsageAsync_GivesTheCreditBack()
    {
        //Arrange
        SetValue(8m);
        await _service.AddTopUpAsync(UserId, new CreateVoucherTopUpRequest(Today, 80m));
        var usage = (await _service.AddUsageAsync(UserId, new CreateVoucherUsageRequest(Today, 5))).Value!;

        //Act
        var deleted = await _service.DeleteUsageAsync(UserId, usage.Id);

        //Assert
        Assert.True(deleted);
        Assert.Equal(80m, (await _service.GetSummaryAsync(UserId)).Balance);
    }

    [Fact]
    public async Task DeleteUsageAsync_UsageOfAnotherUser_ReturnsFalseAndKeepsIt()
    {
        //Arrange
        var other = Guid.NewGuid();
        SetValue(8m, other);
        await _service.AddTopUpAsync(other, new CreateVoucherTopUpRequest(Today, 80m));
        var usage = (await _service.AddUsageAsync(other, new CreateVoucherUsageRequest(Today, 1))).Value!;

        //Act
        var deleted = await _service.DeleteUsageAsync(UserId, usage.Id);

        //Assert
        Assert.False(deleted);
        Assert.Single(_repository.Usages);
    }

    [Fact]
    public async Task DeleteTopUpAsync_CreditWouldGoNegative_FailsWithConflict()
    {
        //Arrange: 80 euro caricati, 8 buoni da 8 usati (64 euro)
        SetValue(8m);
        var topUp = await _service.AddTopUpAsync(UserId, new CreateVoucherTopUpRequest(Today, 80m));
        await _service.AddUsageAsync(UserId, new CreateVoucherUsageRequest(Today, 8));

        //Act
        var result = await _service.DeleteTopUpAsync(UserId, topUp.Id);

        //Assert
        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.Conflict, result.Error!.Type);
        Assert.Single(_repository.TopUps);
    }

    [Fact]
    public async Task DeleteTopUpAsync_CreditStillCoversTheUsages_DeletesIt()
    {
        //Arrange: due ricariche, usi coperti anche senza la seconda
        SetValue(8m);
        await _service.AddTopUpAsync(UserId, new CreateVoucherTopUpRequest(Today, 80m));
        var second = await _service.AddTopUpAsync(UserId, new CreateVoucherTopUpRequest(Today, 40m));
        await _service.AddUsageAsync(UserId, new CreateVoucherUsageRequest(Today, 2));

        //Act
        var result = await _service.DeleteTopUpAsync(UserId, second.Id);

        //Assert
        Assert.True(result.IsSuccess);
        Assert.Single(_repository.TopUps);
    }

    [Fact]
    public async Task DeleteTopUpAsync_NotFound_FailsWithNotFound()
    {
        //Act
        var result = await _service.DeleteTopUpAsync(UserId, 99);

        //Assert
        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.NotFound, result.Error!.Type);
    }
}
