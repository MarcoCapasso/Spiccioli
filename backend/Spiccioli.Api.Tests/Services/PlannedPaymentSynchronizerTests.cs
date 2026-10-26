using Spiccioli.Api.Models;
using Spiccioli.Api.Services;
using Spiccioli.Api.Tests.Fakes;

namespace Spiccioli.Api.Tests.Services;

//Test del sincronizzatore dei pagamenti previsti, con Repository finti
public class PlannedPaymentSynchronizerTests
{
    private static readonly Guid UserId = Guid.NewGuid();

    //Il valore dell'enum è il numero di mesi tra una scadenza e l'altra
    private const RecurrenceFrequency Monthly = (RecurrenceFrequency)1;
    private const RecurrenceFrequency Quarterly = (RecurrenceFrequency)3;

    private readonly FakeMonthlyBudgetRepository _budgets = new();
    private readonly PlannedPaymentSynchronizer _synchronizer;

    //Oggi è il 15 ottobre 2026: i piani da ottobre in avanti si sincronizzano, settembre no
    public PlannedPaymentSynchronizerTests()
    {
        var time = new FixedTimeProvider(new DateTimeOffset(2026, 10, 15, 12, 0, 0, TimeSpan.Zero));
        _synchronizer = new PlannedPaymentSynchronizer(_budgets, time);
    }

    //Un piano dell'utente nella lista finta
    private MonthlyBudget AddBudget(int year, int month)
    {
        var budget = new MonthlyBudget { Id = year * 100 + month, Year = year, Month = month, UserId = UserId };
        _budgets.Budgets.Add(budget);
        return budget;
    }

    //Una spesa mensile con scadenza il 20 di ogni mese, dal 20 gennaio 2026
    private static RecurringExpense Expense(DateOnly? endDate = null, RecurrenceFrequency frequency = Monthly) => new()
    {
        Id = 1,
        UserId = UserId,
        Name = "Palestra",
        Amount = 30m,
        Frequency = frequency,
        StartDate = new DateOnly(2026, 1, 20),
        EndDate = endDate,
    };

    //Un pagamento già presente nel piano, generato dalla spesa 1
    private static PlannedPayment Payment(int id, string name, decimal amount, DateOnly dueDate) => new()
    {
        Id = id,
        Name = name,
        Amount = amount,
        DueDate = dueDate,
        RecurringExpenseId = 1,
    };

    [Fact]
    public async Task SyncAsync_NewExpense_AddsPaymentToCurrentAndFutureBudgets()
    {
        //Arrange
        var october = AddBudget(2026, 10);
        var november = AddBudget(2026, 11);
        var expense = Expense();

        //Act
        await _synchronizer.SyncAsync(expense);

        //Assert
        var inOctober = Assert.Single(october.PlannedPayments);
        Assert.Equal("Palestra", inOctober.Name);
        Assert.Equal(30m, inOctober.Amount);
        Assert.Equal(new DateOnly(2026, 10, 20), inOctober.DueDate);
        Assert.Same(expense, inOctober.RecurringExpense);

        var inNovember = Assert.Single(november.PlannedPayments);
        Assert.Equal(new DateOnly(2026, 11, 20), inNovember.DueDate);
    }

    [Fact]
    public async Task SyncAsync_PastBudget_IsNotTouched()
    {
        //Arrange
        var september = AddBudget(2026, 9);

        //Act
        await _synchronizer.SyncAsync(Expense());

        //Assert
        Assert.Empty(september.PlannedPayments);
    }

    [Fact]
    public async Task SyncAsync_BudgetWhereExpenseIsNotDue_AddsNothing()
    {
        //Arrange: ogni tre mesi dal 20 gennaio, quindi gennaio, aprile, luglio, ottobre, gennaio...
        var october = AddBudget(2026, 10);
        var november = AddBudget(2026, 11);

        //Act
        await _synchronizer.SyncAsync(Expense(frequency: Quarterly));

        //Assert
        Assert.Single(october.PlannedPayments);
        Assert.Empty(november.PlannedPayments);
    }

    [Fact]
    public async Task SyncAsync_ExistingUnpaidPayment_UpdatesNameAmountAndDueDate()
    {
        //Arrange
        var october = AddBudget(2026, 10);
        october.PlannedPayments.Add(Payment(10, "Vecchio nome", 10m, new DateOnly(2026, 10, 5)));

        //Act
        await _synchronizer.SyncAsync(Expense());

        //Assert
        var payment = Assert.Single(october.PlannedPayments);
        Assert.Equal("Palestra", payment.Name);
        Assert.Equal(30m, payment.Amount);
        Assert.Equal(new DateOnly(2026, 10, 20), payment.DueDate);
    }

    [Fact]
    public async Task SyncAsync_PaidPayment_IsNotTouched()
    {
        //Arrange
        var october = AddBudget(2026, 10);
        october.PlannedPayments.Add(Payment(10, "Vecchio nome", 10m, new DateOnly(2026, 10, 5)));
        _budgets.PaidPaymentIds.Add(10);

        //Act
        await _synchronizer.SyncAsync(Expense());

        //Assert
        var payment = Assert.Single(october.PlannedPayments);
        Assert.Equal("Vecchio nome", payment.Name);
        Assert.Equal(10m, payment.Amount);
        Assert.Equal(new DateOnly(2026, 10, 5), payment.DueDate);
    }

    [Fact]
    public async Task SyncAsync_ExpenseEnded_RemovesUnpaidPaymentsAfterTheEnd()
    {
        //Arrange
        var october = AddBudget(2026, 10);
        var november = AddBudget(2026, 11);
        october.PlannedPayments.Add(Payment(10, "Palestra", 30m, new DateOnly(2026, 10, 20)));
        november.PlannedPayments.Add(Payment(11, "Palestra", 30m, new DateOnly(2026, 11, 20)));

        //Act: finisce il 31 ottobre
        await _synchronizer.SyncAsync(Expense(endDate: new DateOnly(2026, 10, 31)));

        //Assert
        Assert.Single(october.PlannedPayments);
        Assert.Empty(november.PlannedPayments);
    }

    [Fact]
    public async Task SyncAsync_ExpenseEnded_KeepsPaidPaymentsAfterTheEnd()
    {
        //Arrange
        var november = AddBudget(2026, 11);
        november.PlannedPayments.Add(Payment(11, "Palestra", 30m, new DateOnly(2026, 11, 20)));
        _budgets.PaidPaymentIds.Add(11);

        //Act
        await _synchronizer.SyncAsync(Expense(endDate: new DateOnly(2026, 10, 31)));

        //Assert: saldato = storico, non si tocca
        Assert.Single(november.PlannedPayments);
    }
}