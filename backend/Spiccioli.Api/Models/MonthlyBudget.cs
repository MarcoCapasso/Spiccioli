namespace Spiccioli.Api.Models;

public class MonthlyBudget
{
    public int Id { get; set; }
    public int Year { get; set; }
    
    //Deve essere compreso tra 1 e 12, controllato nel Service
    public int Month { get; set; } 
    public decimal PlannedIncome { get; set; }
    public decimal SavingsTarget { get; set; }

    //Relazione con User
    public Guid UserId { get; set; }
    public User? User { get; set; }
    
    //Le voci e pagamenti di budget mensile, si caricano sempre insieme al piano
    public List<BudgetAllocation> Allocations { get; set; } = new();
    public List<PlannedPayment> PlannedPayments { get; set; } = new();
}