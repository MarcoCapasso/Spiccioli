using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Microsoft.EntityFrameworkCore;
using Spiccioli.Api.Common;
using Spiccioli.Api.Models;
using Spiccioli.Api.Data.Configurations;

namespace Spiccioli.Api.Data;

//Una tabella per ogni DbSet
public class AppDbContext : DbContext
{
    private readonly IFieldCipher _cipher;

    //Riceve la configurazione dalla DI (provider, connection string) e il cifratore dei testi
    public AppDbContext(DbContextOptions<AppDbContext> options, IFieldCipher cipher)
        : base(options)
    {
        _cipher = cipher;
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<MonthlyBudget> MonthlyBudgets => Set<MonthlyBudget>();
    public DbSet<BudgetAllocation> BudgetAllocations => Set<BudgetAllocation>();
    public DbSet<RecurringExpense> RecurringExpenses => Set<RecurringExpense>();
    public DbSet<PlannedPayment> PlannedPayments => Set<PlannedPayment>();
    public DbSet<VoucherSettings> VoucherSettings => Set<VoucherSettings>();
    public DbSet<VoucherTopUp> VoucherTopUps => Set<VoucherTopUp>();
    public DbSet<VoucherUsage> VoucherUsages => Set<VoucherUsage>();


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
        modelBuilder.ApplyConfiguration(new VoucherSettingsConfiguration());
        modelBuilder.ApplyConfiguration(new VoucherTopUpConfiguration());
        modelBuilder.ApplyConfiguration(new VoucherUsageConfiguration());

        ApplyEncryption(modelBuilder);
    }

    //L'elenco di tutti i testi cifrati nel database. Per cifrarne un altro basta aggiungerlo qui
    //(e allargare la colonna con una migration). Cifrati non si possono cercare, ordinare o confrontare in SQL
    private void ApplyEncryption(ModelBuilder modelBuilder)
    {
        //Tipato come ValueConverter generico: così vale sia per le colonne string che per quelle string? (niente avvisi sui null)
        ValueConverter encrypted = new EncryptedStringConverter(_cipher);

        modelBuilder.Entity<Transaction>(e =>
        {
            e.Property(t => t.Description).HasConversion(encrypted);
            e.Property(t => t.Note).HasConversion(encrypted);
        });
        modelBuilder.Entity<Category>().Property(c => c.Name).HasConversion(encrypted);
        modelBuilder.Entity<RecurringExpense>().Property(r => r.Name).HasConversion(encrypted);
        modelBuilder.Entity<PlannedPayment>().Property(p => p.Name).HasConversion(encrypted);
        modelBuilder.Entity<VoucherUsage>().Property(u => u.Note).HasConversion(encrypted);
    }

    //Convenzione del progetto, ogni decimal è un importo in euro
    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder.Properties<decimal>().HavePrecision(18, 2);
    }

    //Prima di ogni salvataggio si aggiorna l'impronta dei nomi delle categorie nuove o modificate:
    //così nessun Service o Repository può dimenticarsene
    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        UpdateCategoryNameKeys();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        UpdateCategoryNameKeys();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private void UpdateCategoryNameKeys()
    {
        //Serve per accorgersi di un nome cambiato su una categoria già letta
        ChangeTracker.DetectChanges();

        foreach (var entry in ChangeTracker.Entries<Category>()
                     .Where(e => e.State is EntityState.Added or EntityState.Modified))
        {
            entry.Entity.NameKey = _cipher.BlindIndex(entry.Entity.Name);
        }
    }
}
