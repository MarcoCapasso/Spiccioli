using Spiccioli.Api.Models;
using Spiccioli.Api.Services;
using Spiccioli.Api.Tests.Fakes;

namespace Spiccioli.Api.Tests.Services;

//Test dell'eliminazione delle spese ricorrenti di RecurringExpenseService, con Repository finti
public class RecurringExpenseServiceTests
{
    private static readonly Guid UserId = Guid.NewGuid();

    private readonly FakeRecurringExpenseRepository _expenses = new();
    private readonly FakeCategoryRepository _categories = new();
    private readonly FakePlannedPaymentSynchronizer _synchronizer = new();
    private readonly RecurringExpenseService _service;

    //Oggi è il 15 ottobre 2026: la fine del mese è il 31
    public RecurringExpenseServiceTests()
    {
        var time = new FixedTimeProvider(new DateTimeOffset(2026, 10, 15, 12, 0, 0, TimeSpan.Zero));
        _service = new RecurringExpenseService(_expenses, new CategoryValidator(_categories), _synchronizer, time);
    }

    //Una spesa dell'utente nella lista finta
    private RecurringExpense AddExpense(int id, DateOnly? endDate = null, Guid? userId = null)
    {
        var expense = new RecurringExpense
        {
            Id = id,
            Name = "Palestra",
            Amount = 30m,
            StartDate = new DateOnly(2026, 1, 1),
            EndDate = endDate,
            UserId = userId ?? UserId,
        };
        _expenses.Expenses.Add(expense);
        return expense;
    }

    [Fact]
    public async Task DeleteAsync_ExpenseNotFound_ReturnsFalse()
    {
        //Act
        var deleted = await _service.DeleteAsync(UserId, 99);

        //Assert
        Assert.False(deleted);
    }

    [Fact]
    public async Task DeleteAsync_ExpenseOfAnotherUser_ReturnsFalseAndKeepsIt()
    {
        //Arrange
        AddExpense(1, userId: Guid.NewGuid());

        //Act
        var deleted = await _service.DeleteAsync(UserId, 1);

        //Assert
        Assert.False(deleted);
        Assert.Single(_expenses.Expenses);
    }

    [Fact]
    public async Task DeleteAsync_NeverUsed_DeletesExpense()
    {
        //Arrange
        AddExpense(1);

        //Act
        var deleted = await _service.DeleteAsync(UserId, 1);

        //Assert
        Assert.True(deleted);
        Assert.Empty(_expenses.Expenses);
        Assert.Empty(_synchronizer.Synced);
    }

    [Fact]
    public async Task DeleteAsync_WithPaidPayments_KeepsExpenseAndEndsItAtEndOfCurrentMonth()
    {
        //Arrange
        var expense = AddExpense(1);
        _expenses.WithPaidPayments.Add(1);

        //Act
        var deleted = await _service.DeleteAsync(UserId, 1);

        //Assert
        Assert.True(deleted);
        Assert.Same(expense, Assert.Single(_expenses.Expenses));
        Assert.Equal(new DateOnly(2026, 10, 31), expense.EndDate);

        //I pagamenti non saldati dei mesi successivi vengono tolti dal sincronizzatore, e tutto viene salvato
        Assert.Same(expense, Assert.Single(_synchronizer.Synced));
        Assert.Equal(1, _expenses.SaveChangesCount);
    }

    [Fact]
    public async Task DeleteAsync_WithPaidPaymentsAndEndingLater_ShortensEndToEndOfCurrentMonth()
    {
        //Arrange
        var expense = AddExpense(1, endDate: new DateOnly(2027, 3, 1));
        _expenses.WithPaidPayments.Add(1);

        //Act
        await _service.DeleteAsync(UserId, 1);

        //Assert
        Assert.Equal(new DateOnly(2026, 10, 31), expense.EndDate);
    }

    [Fact]
    public async Task DeleteAsync_WithPaidPaymentsAndAlreadyEnded_DoesNotExtendTheEnd()
    {
        //Arrange
        var expense = AddExpense(1, endDate: new DateOnly(2026, 10, 20));
        _expenses.WithPaidPayments.Add(1);

        //Act
        var deleted = await _service.DeleteAsync(UserId, 1);

        //Assert
        Assert.True(deleted);
        Assert.Equal(new DateOnly(2026, 10, 20), expense.EndDate);
        Assert.Empty(_synchronizer.Synced);
        Assert.Equal(0, _expenses.SaveChangesCount);
    }
}