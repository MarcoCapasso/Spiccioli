using Spiccioli.Api.Models;

namespace Spiccioli.Api.Repositories;

//I criteri con cui si filtrano le transazioni: tutti facoltativi
public record TransactionCriteria(
    DateOnly? From = null,
    DateOnly? To = null,
    int? CategoryId = null,
    TransactionType? Type = null,
    string? Search = null);