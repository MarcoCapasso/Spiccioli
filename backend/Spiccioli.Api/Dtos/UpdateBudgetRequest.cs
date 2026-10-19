using System.ComponentModel.DataAnnotations;

namespace Spiccioli.Api.Dtos;

//I valori del piano che l'utente imposta: entrate previste e obiettivo di risparmio
public record UpdateBudgetRequest(
    [Range(typeof(decimal), "0", "999999999", ErrorMessage = "Le entrate previste non possono essere negative.")]
    decimal PlannedIncome,

    [Range(typeof(decimal), "0", "999999999", ErrorMessage = "L'obiettivo di risparmio non può essere negativo.")]
    decimal SavingsTarget
);