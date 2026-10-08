namespace Spiccioli.Api.Dtos;

//Filtri facoltativi dell'elenco transazioni, letti dalla query
public record TransactionFilter(
    DateOnly? From,
    DateOnly? To,
    int? CategoryId
);