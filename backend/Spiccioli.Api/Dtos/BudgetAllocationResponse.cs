namespace Spiccioli.Api.Dtos;

public record BudgetAllocationResponse(
    int CategoryId,
    string? CategoryName,
    decimal Amount
);