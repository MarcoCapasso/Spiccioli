using Spiccioli.Api.Models;

namespace Spiccioli.Api.Dtos;

public record CreateCategoryRequest(
    string Name,
    TransactionType Type
);