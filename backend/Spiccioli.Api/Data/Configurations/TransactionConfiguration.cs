using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Data.Configurations;

//Regole del database per la tabella Transactions
public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        //Se la categoria viene eliminata la transazione resta senza categoria, non si elimina l'intera transazione
        builder.HasOne(t => t.Category)
            .WithMany()
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        //Se l'utente viene eliminato anche le sue transazioni vengono eliminate
        builder.HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        //Uno a uno: un pagamento previsto ha al massimo una transazione (EF Core crea un indice unico),
        //la difesa definitiva contro i doppi pagamenti, anche con richieste simultanee.
        //Pagamento previsto eliminato: la transazione resta (è realtà), solo scollegata
        builder.HasOne(t => t.PlannedPayment)
            .WithOne()
            .HasForeignKey<Transaction>(t => t.PlannedPaymentId)
            .OnDelete(DeleteBehavior.SetNull);

        //Lunghezza massima per la descrizione
        builder.Property(t => t.Description).HasMaxLength(200);
    }
}