using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Data.Configurations;

//Regole del database per la tabella MonthlyBudget
public class MonthlyBudgetConfiguration : IEntityTypeConfiguration<MonthlyBudget>
{
    public void Configure(EntityTypeBuilder<MonthlyBudget> builder)
    {
        //Se l'utente viene eliminato anche il suo budget mensile viene eliminato
        builder.HasOne(m => m.User)
            .WithMany()
            .HasForeignKey(m => m.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        //Indice unico: un solo piano per utente per ogni mese
        builder.HasIndex(m => new { m.UserId, m.Year, m.Month }).IsUnique();
    }
}