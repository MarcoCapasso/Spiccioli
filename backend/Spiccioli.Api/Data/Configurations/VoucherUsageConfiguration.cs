using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Data.Configurations;

//Regole del database per la tabella VoucherUsages
public class VoucherUsageConfiguration : IEntityTypeConfiguration<VoucherUsage>
{
    public void Configure(EntityTypeBuilder<VoucherUsage> builder)
    {
        //Se l'utente viene eliminato anche i suoi usi vengono eliminati
        builder.HasOne(u => u.User)
            .WithMany()
            .HasForeignKey(u => u.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        //Lunghezza massima per la nota
        builder.Property(u => u.Note).HasMaxLength(240);
    }
}
