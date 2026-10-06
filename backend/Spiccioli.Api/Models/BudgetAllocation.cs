namespace Spiccioli.Api.Models;


//Rappresenta il tetto di spesa previsto per una categoria in un mese specifico
public class BudgetAllocation
{
    public int Id { get; set; }

    //Importo previsto, sempre positivo
    public decimal Amount { get; set; }

    //Il piano mensile a cui appartiene la voce
    public int MonthlyBudgetId { get; set; }
    public MonthlyBudget? MonthlyBudget { get; set; }

    //La categoria di spesa a cui si riferisce
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
}