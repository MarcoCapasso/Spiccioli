using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Data.Configurations;

//Regole del database per la tabella Category
public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        //Il nome è cifrato (vedi AppDbContext): la lunghezza massima (50) la controllano i DTO
        //L'impronta è un hash SHA-256 in esadecimale: sempre 64 caratteri
        builder.Property(c => c.NameKey).HasMaxLength(64);

        //Se l'utente viene eliminato anche le sue categorie vengono eliminate
        builder.HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        //Lo utente non può avere due categorie con lo stesso nome: il confronto è sull'impronta,
        //perché il nome è cifrato (i valori null, cioè i dati prima della cifratura, non si scontrano tra loro)
        builder.HasIndex(c => new { c.UserId, c.NameKey }).IsUnique();

        builder.Property(c => c.Color).HasMaxLength(7);
    }
}
