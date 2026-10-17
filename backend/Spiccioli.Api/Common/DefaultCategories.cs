using Spiccioli.Api.Dtos;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Common;

public static class DefaultCategories
{
    public static readonly IReadOnlyList<DefaultCategory> All =
    [
        new("Alimentari", TransactionType.Expense),
        new("Casa", TransactionType.Expense),
        new("Bollette", TransactionType.Expense),
        new("Trasporti", TransactionType.Expense),
        new("Salute", TransactionType.Expense),
        new("Svago", TransactionType.Expense),
        new("Abbonamenti", TransactionType.Expense),
        new("Stipendio", TransactionType.Income),
        new("Altre entrate", TransactionType.Income),
    ];
}