using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Data.Configurations;

//Regole del database per la tabella PlannedPayments
public class PlannedPaymentConfiguration : IEntityTypeConfiguration<PlannedPayment>
{
    public void Configure(EntityTypeBuilder<PlannedPayment> builder)
    {
        builder.Property(p => p.Name).HasMaxLength(100);

        //Piano eliminato, i suoi pagamenti previsti spariscono con lui
        builder.HasOne(p => p.MonthlyBudget)
            .WithMany(m => m.PlannedPayments)
            .HasForeignKey(p => p.MonthlyBudgetId)
            .OnDelete(DeleteBehavior.Cascade);

        //Il database impedisce di eliminare una spesa ricorrente che ha ancora pagamenti previsti
        // il Service elimina prima quelli non saldati, e se ce n'è uno saldato la spesa si chiude con EndDate
        builder.HasOne(p => p.RecurringExpense)
            .WithMany()
            .HasForeignKey(p => p.RecurringExpenseId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}