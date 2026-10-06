namespace Spiccioli.Api.Models;

public class PlannedPayment
{
    public int Id { get; set;}

    //Copiati dal modello alla creazione del piano: se il modello cambia, il passato no
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateOnly DueDate { get; set; }
    
    //Relazione con il budget mensile
    public int MonthlyBudgetId { get; set; }
    public MonthlyBudget? MonthlyBudget { get; set; }

    //Relazione con le spese ricorrenti
    public int RecurringExpenseId { get; set; }
    public RecurringExpense? RecurringExpense { get; set; }

}