namespace Spiccioli.Api.Dtos;

//L'andamento di una categoria nel mese: previsto contro speso.
//Allocated è null se la categoria non è nel piano (spesa non pianificata), 0 se l'utente ha deciso di non spendere
public record CategoryProgressResponse(
    int? CategoryId,
    string? CategoryName,
    decimal? Allocated,
    decimal Spent)
{
    public bool IsPlanned => Allocated is not null;

    //Quanto resta: negativo se sforata, null se non pianificata
    public decimal? Remaining => Allocated - Spent;

    public bool IsOverBudget => Allocated is not null && Spent > Allocated;
}