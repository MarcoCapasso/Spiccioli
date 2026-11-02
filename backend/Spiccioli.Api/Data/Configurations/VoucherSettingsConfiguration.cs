using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Data.Configurations;

//Regole del database per la tabella VoucherSettings
public class VoucherSettingsConfiguration : IEntityTypeConfiguration<VoucherSettings>
{
    public void Configure(EntityTypeBuilder<VoucherSettings> builder)
    {
        //La chiave primaria è l'utente: al massimo una riga per utente
        builder.HasKey(s => s.UserId);

        //Se l'utente viene eliminato anche le sue impostazioni dei buoni vengono eliminate
        builder.HasOne(s => s.User)
            .WithOne()
            .HasForeignKey<VoucherSettings>(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
