using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Data.Configurations;

//Regole del database per la tabella di allocazione Budget
public class BudgetAllocationConfiguration : IEntityTypeConfiguration<BudgetAllocation>
{
    public void Configure(EntityTypeBuilder<BudgetAllocation> builder)
    {
        // Piano eliminato: le sue voci spariscono con lui
        builder.HasOne(b => b.MonthlyBudget)
            .WithMany(m => m.Allocations)
            .HasForeignKey(b => b.MonthlyBudgetId)
            .OnDelete(DeleteBehavior.Cascade);  

        builder.HasOne(b => b.Category)
            .WithMany()
            .HasForeignKey(b => b.CategoryId)
            .OnDelete(DeleteBehavior.NoAction);

        // Indice unico: nello stesso piano, una categoria può avere una sola voce di budget
        builder.HasIndex(b => new { b.MonthlyBudgetId, b.CategoryId }).IsUnique();
    }
}