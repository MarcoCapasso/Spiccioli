namespace Spiccioli.Api.Dtos;

//Intervallo di date facoltativo letto da query string
public record DateRangeFilter(
    DateOnly? From,
    DateOnly? To
);