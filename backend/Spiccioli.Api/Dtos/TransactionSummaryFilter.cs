namespace Spiccioli.Api.Dtos;

//Filtri facoltativi del riepilogo
public record TransactionSummaryFilter(
    DateOnly? From,
    DateOnly? To,
    int? CategoryId
);