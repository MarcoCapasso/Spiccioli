using Spiccioli.Api.Common;
using Spiccioli.Api.Dtos;
using Spiccioli.Api.Models;
using Spiccioli.Api.Repositories;

namespace Spiccioli.Api.Services;

//Compone il piano, i totali delle transazioni e i pagamenti previsti nel riepilogo del mese
public class DashboardService : IDashboardService
{
    private readonly IMonthlyBudgetRepository _budgets;
    private readonly ITransactionRepository _transactions;

    public DashboardService(IMonthlyBudgetRepository budgets, ITransactionRepository transactions)
    {
        _budgets = budgets;
        _transactions = transactions;
    }

    public async Task<Result<DashboardResponse>> GetAsync(Guid userId, int year, int month)
    {
        var budget = await _budgets.GetAsync(userId, year, month);
        if (budget is null)
        {
            return Result<DashboardResponse>.Failure(
                Error.NotFound("Piano del mese non trovato: aprilo prima di consultarne l'andamento."));
        }

        //Il periodo del mese, dal primo all'ultimo giorno
        var from = new DateOnly(year, month, 1);
        var to = new DateOnly(year, month, DateTime.DaysInMonth(year, month));

        //Il reale, con le query della Fase 6: totali del mese e totali per categoria
        var (actualIncome, actualExpense, _, _) = await _transactions.GetTotalsAsync(userId, new TransactionCriteria(from, to));
        var categoryTotals = await _transactions.GetTotalsByCategoryAsync(userId, from, to);

        //Le scadenze ancora da pagare: quelle senza una transazione collegata
        var paidIds = await _budgets.GetPaidPaymentIdsAsync(budget.PlannedPayments.Select(p => p.Id));
        var pending = budget.PlannedPayments.Where(p => !paidIds.Contains(p.Id)).ToList();

        var categories = BuildCategoryProgress(budget, categoryTotals);

        return Result<DashboardResponse>.Success(new DashboardResponse(
            year,
            month,
            budget.PlannedIncome,
            budget.SavingsTarget,
            budget.Allocations.Sum(a => a.Amount),
            actualIncome,
            actualExpense,
            pending.Sum(p => p.Amount),
            pending.Count,
            categories));
    }

    //Passo 3: previsto contro speso, per ogni categoria del piano o delle spese
        private static IReadOnlyList<CategoryProgressResponse> BuildCategoryProgress(
        MonthlyBudget budget,
        IReadOnlyList<(int? CategoryId, string? CategoryName, TransactionType Type, decimal Total, int Count)> categoryTotals)
    {
       //Solo le uscite: le entrate non hanno voci di spesa da confrontare
        var expenses = categoryTotals.Where(t => t.Type == TransactionType.Expense).ToList();

        //1. Le categorie del piano, con quanto è stato speso (zero se nulla)
        var planned = budget.Allocations.Select(a => new CategoryProgressResponse(
            a.CategoryId,
            a.Category?.Name,
            a.Amount,
            expenses.Where(e => e.CategoryId == a.CategoryId).Sum(e => e.Total)));

        //2. Le spese fuori dal piano: categorie senza voce, e transazioni senza categoria
        var plannedIds = budget.Allocations.Select(a => a.CategoryId).ToHashSet();
        var unplanned = expenses
            .Where(e => e.CategoryId is null || !plannedIds.Contains(e.CategoryId.Value))
            .Select(e => new CategoryProgressResponse(e.CategoryId, e.CategoryName, null, e.Total));

        //Prima le pianificate, poi le altre, ciascun gruppo in ordine di nome
        return planned.OrderBy(c => c.CategoryName)
            .Concat(unplanned.OrderBy(c => c.CategoryName))
            .ToList();
    }
}