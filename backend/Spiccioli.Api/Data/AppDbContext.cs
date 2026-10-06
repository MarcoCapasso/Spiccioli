using Microsoft.EntityFrameworkCore;
using Spiccioli.Api.Models;
using Spiccioli.Api.Data.Configurations;

namespace Spiccioli.Api.Data;

//Una tabella per ogni DbSet
public class AppDbContext : DbContext
{
    //Riceve la configurazione dalla DI (provider, connection string)
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<MonthlyBudget> MonthlyBudgets => Set<MonthlyBudget>();
    public DbSet<BudgetAllocation> BudgetAllocations => Set<BudgetAllocation>();
    public DbSet<RecurringExpense> RecurringExpenses => Set<RecurringExpense>();
    public DbSet<PlannedPayment> PlannedPayments => Set<PlannedPayment>();


    //Applica le regole definite nelle classi di configurazione
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new CategoryConfiguration());
        modelBuilder.ApplyConfiguration(new TransactionConfiguration());
        modelBuilder.ApplyConfiguration(new MonthlyBudgetConfiguration());
        modelBuilder.ApplyConfiguration(new BudgetAllocationConfiguration());
        modelBuilder.ApplyConfiguration(new RecurringExpenseConfiguration());
        modelBuilder.ApplyConfiguration(new PlannedPaymentConfiguration());
        
    }

    //Convenzione del progetto, ogni decimal è un importo in euro
    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder.Properties<decimal>().HavePrecision(18, 2);
    }
}