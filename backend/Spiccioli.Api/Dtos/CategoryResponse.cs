using Spiccioli.Api.Models;

namespace Spiccioli.Api.Dtos;

public record CategoryResponse(
    int Id,
    string Name,
    TransactionType Type,
    bool IsArchived
);