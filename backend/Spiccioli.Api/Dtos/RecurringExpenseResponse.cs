using Spiccioli.Api.Models;

namespace Spiccioli.Api.Dtos;

//Ciò che il client riceve su una spesa ricorrente
public record RecurringExpenseResponse(
    int Id,
    string Name,
    decimal Amount,
    RecurrenceFrequency Frequency,
    DateOnly StartDate,
    DateOnly? EndDate,
    int CategoryId,
    string? CategoryName);