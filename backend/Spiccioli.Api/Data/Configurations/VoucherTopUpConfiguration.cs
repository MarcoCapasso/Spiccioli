using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Data.Configurations;

//Regole del database per la tabella VoucherTopUps
public class VoucherTopUpConfiguration : IEntityTypeConfiguration<VoucherTopUp>
{
    public void Configure(EntityTypeBuilder<VoucherTopUp> builder)
    {
        //Se l'utente viene eliminato anche le sue ricariche vengono eliminate
        builder.HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
