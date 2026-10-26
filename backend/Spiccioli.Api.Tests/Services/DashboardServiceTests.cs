using Spiccioli.Api.Common;
using Spiccioli.Api.Models;
using Spiccioli.Api.Services;
using Spiccioli.Api.Tests.Fakes;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Tests.Services;

//Test del riepilogo del mese di DashboardService, con Repository finti
public class DashboardServiceTests
{
    private static readonly Guid UserId = Guid.NewGuid();

    private readonly FakeMonthlyBudgetRepository _budgets = new();
    private readonly FakeTransactionRepository _transactions = new();
    private readonly DashboardService _service;

    public DashboardServiceTests()
    {
        _service = new DashboardService(_budgets, _transactions);
    }

    //Una voce del piano
    private static BudgetAllocation Allocation(int categoryId, string name, decimal amount) => new()
    {
        CategoryId = categoryId,
        Category = new Category { Id = categoryId, Name = name },
        Amount = amount,
    };

    //Il piano di ottobre 2026: entrate 2000, risparmio 300, voci Alimentari 400 e Svago 100
    private MonthlyBudget AddBudget()
    {
        var budget = new MonthlyBudget
        {
            Id = 1,
            Year = 2026,
            Month = 10,
            UserId = UserId,
            PlannedIncome = 2000m,
            SavingsTarget = 300m,
        };
        budget.Allocations.Add(Allocation(1, "Alimentari", 400m));
        budget.Allocations.Add(Allocation(2, "Svago", 100m));
        _budgets.Budgets.Add(budget);
        return budget;
    }

    [Fact]
    public async Task GetAsync_BudgetNotOpen_ReturnsNotFound()
    {
        //Act
        var result = await _service.GetAsync(UserId, 2026, 10);

        //Assert
        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorType.NotFound, result.Error!.Type);
    }

    [Fact]
    public async Task GetAsync_CopiesPlanAndComputesUnallocated()
    {
        //Arrange
        AddBudget();

        //Act
        var result = await _service.GetAsync(UserId, 2026, 10);

        //Assert: 2000 - 300 - (400 + 100) = 1200
        var dashboard = result.Value!;
        Assert.Equal(2000m, dashboard.PlannedIncome);
        Assert.Equal(300m, dashboard.SavingsTarget);
        Assert.Equal(500m, dashboard.TotalAllocated);
        Assert.Equal(1200m, dashboard.Unallocated);
    }

    [Fact]
    public async Task GetAsync_ActualComesFromTheTotalsOfTheWholeMonth()
    {
        //Arrange
        AddBudget();
        _transactions.Totals = new TransactionTotals(1800m, 650m, 0, 0);

        //Act
        var result = await _service.GetAsync(UserId, 2026, 10);

        //Assert
        var dashboard = result.Value!;
        Assert.Equal(1800m, dashboard.ActualIncome);
        Assert.Equal(650m, dashboard.ActualExpense);
        Assert.Equal(1150m, dashboard.ActualSavings);

        //Il periodo è dal primo all'ultimo giorno del mese
        Assert.Equal(new DateOnly(2026, 10, 1), _transactions.LastCriteria!.From);
        Assert.Equal(new DateOnly(2026, 10, 31), _transactions.LastCriteria.To);
    }

    [Fact]
    public async Task GetAsync_PendingPayments_ExcludePaidOnes()
    {
        //Arrange
        var budget = AddBudget();
        budget.PlannedPayments.Add(new PlannedPayment { Id = 1, Name = "Affitto", Amount = 30m });
        budget.PlannedPayments.Add(new PlannedPayment { Id = 2, Name = "Palestra", Amount = 50m });
        budget.PlannedPayments.Add(new PlannedPayment { Id = 3, Name = "Internet", Amount = 20m });
        _budgets.PaidPaymentIds.Add(1);

        //Act
        var result = await _service.GetAsync(UserId, 2026, 10);

        //Assert: restano Palestra e Internet
        var dashboard = result.Value!;
        Assert.Equal(2, dashboard.PendingPaymentsCount);
        Assert.Equal(70m, dashboard.PendingPaymentsTotal);
    }

    [Fact]
    public async Task GetAsync_Categories_PlannedFirstThenUnplannedAndNoIncome()
    {
        //Arrange
        AddBudget();
        _transactions.CategoryTotals.Add((1, "Alimentari", TransactionType.Expense, 150m, 3));
        _transactions.CategoryTotals.Add((3, "Auto", TransactionType.Expense, 80m, 1));
        _transactions.CategoryTotals.Add((null, null, TransactionType.Expense, 25m, 1));
        _transactions.CategoryTotals.Add((9, "Stipendio", TransactionType.Income, 1800m, 1));

        //Act
        var result = await _service.GetAsync(UserId, 2026, 10);

        //Assert: prima le due del piano (anche Svago, con zero speso), poi le spese fuori piano
        var categories = result.Value!.Categories;
        Assert.Equal(4, categories.Count);

        Assert.Equal("Alimentari", categories[0].CategoryName);
        Assert.Equal(400m, categories[0].Allocated);
        Assert.Equal(150m, categories[0].Spent);

        Assert.Equal("Svago", categories[1].CategoryName);
        Assert.Equal(100m, categories[1].Allocated);
        Assert.Equal(0m, categories[1].Spent);

        //Le ultime due non sono nel piano: Allocated è null
        Assert.All(categories.Skip(2), c => Assert.Null(c.Allocated));
        Assert.Contains(categories, c => c.CategoryName == "Auto" && c.Spent == 80m);
        Assert.Contains(categories, c => c.CategoryId is null && c.Spent == 25m);

        //Le entrate non sono voci di spesa
        Assert.DoesNotContain(categories, c => c.CategoryName == "Stipendio");
    }

    [Fact]
    public async Task GetAsync_SpentOverAllocation_IsOverBudget()
    {
        //Arrange
        AddBudget();
        _transactions.CategoryTotals.Add((2, "Svago", TransactionType.Expense, 130m, 4));

        //Act
        var result = await _service.GetAsync(UserId, 2026, 10);

        //Assert
        var leisure = result.Value!.Categories.Single(c => c.CategoryName == "Svago");
        Assert.True(leisure.IsOverBudget);
        Assert.Equal(-30m, leisure.Remaining);
    }
}