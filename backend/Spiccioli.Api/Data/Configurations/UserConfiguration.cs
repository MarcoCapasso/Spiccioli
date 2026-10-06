using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Spiccioli.Api.Models;

namespace Spiccioli.Api.Data.Configurations;

//Regole del database per la tabella User
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        //Lunghezza massima per l'email
        builder.Property(u => u.Email).HasMaxLength(256);

        //No email duplicate
        builder.HasIndex(u => u.Email).IsUnique();

        builder.Property(u => u.FirstName).HasMaxLength(100);

        builder.Property(u => u.LastName).HasMaxLength(100);
    }
}