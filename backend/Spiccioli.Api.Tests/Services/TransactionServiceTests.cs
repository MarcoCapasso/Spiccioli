using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Models;
using Spiccioli.Api.Services;
using Spiccioli.Api.Tests.Fakes;

namespace Spiccioli.Api.Tests.Services;

//Test delle regole di business di TransactionService, con Repository finti
public class TransactionServiceTests
{
    private static readonly Guid UserId = Guid.NewGuid();

    private readonly FakeTransactionRepository _transactions = new();
    private readonly FakeCategoryRepository _categories = new();
    private readonly TransactionService _service;

    //xUnit crea una nuova istanza per ogni test, ognuno parte da Repository vuoti
    public TransactionServiceTests()
    {
        _service = new TransactionService(_transactions, new CategoryValidator(_categories));
    }

    [Fact]
    public async Task CreateAsync_CategoryNotFound_ReturnsValidationErrorAndSavesNothing()
    {
        //Arrange
        var request = new CreateTransactionRequest(
            10m, new DateOnly(2026, 10, 15), TransactionType.Expense, 99, null);

        //Act
        var result = await _service.CreateAsync(UserId, request);

        //Assert
        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.Validation, result.Error!.Type);
        Assert.Empty(_transactions.Transactions);
    }

    [Fact]
    public async Task CreateAsync_CategoryOfAnotherUser_ReturnsValidationErrorAndSavesNothing()
    {
        //Arrange
        _categories.Categories.Add(new Category
        {
            Id = 1,
            Name = "Alimentari",
            Type = TransactionType.Expense,
            UserId = Guid.NewGuid(),
        });

        var request = new CreateTransactionRequest(
            10m, new DateOnly(2026, 10, 15), TransactionType.Expense, 1, null);

        //Act
        var result = await _service.CreateAsync(UserId, request);

        //Assert
        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.Validation, result.Error!.Type);
        Assert.Empty(_transactions.Transactions);
    }

    [Fact]
    public async Task CreateAsync_ArchivedCategory_ReturnsValidationErrorAndSavesNothing()
    {
        //Arrange
        _categories.Categories.Add(new Category
        {
            Id = 1,
            Name = "Alimentari",
            Type = TransactionType.Expense,
            UserId = UserId,
            IsArchived = true,
        });

        var request = new CreateTransactionRequest(
            10m, new DateOnly(2026, 10, 15), TransactionType.Expense, 1, null);

        //Act
        var result = await _service.CreateAsync(UserId, request);

        //Assert
        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.Validation, result.Error!.Type);
        Assert.Empty(_transactions.Transactions);
    }

    [Fact]
    public async Task CreateAsync_CategoryTypeMismatch_ReturnsValidationErrorAndSavesNothing()
    {
        //Arrange
        _categories.Categories.Add(new Category
        {
            Id = 1,
            Name = "Alimentari",
            Type = TransactionType.Income,
            UserId = UserId,
        });
        var request = new CreateTransactionRequest(
            10m, new DateOnly(2026, 10, 15), TransactionType.Expense, 1, null);

        //Act
        var result = await _service.CreateAsync(UserId, request);

        //Assert
        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.Validation, result.Error!.Type);
        Assert.Empty(_transactions.Transactions);
    }

    [Fact]
    public async Task CreateAsync_ValidCategory_ReturnsSuccessAndSavesTransaction()
    {
        //Arrange
        _categories.Categories.Add(new Category
        {
            Id = 1,
            Name = "Alimentari",
            Type = TransactionType.Expense,
            UserId = UserId,
        });

        var request = new CreateTransactionRequest(
            10m, new DateOnly(2026, 10, 15), TransactionType.Expense, 1, null);

        //Act
        var result = await _service.CreateAsync(UserId, request);

        //Assert
        Assert.True(result.IsSuccess);

        var saved = Assert.Single(_transactions.Transactions);
        Assert.Equal(10m, saved.Amount);
        Assert.Equal(UserId, saved.UserId);
        Assert.Equal(1, saved.CategoryId);
    }


}