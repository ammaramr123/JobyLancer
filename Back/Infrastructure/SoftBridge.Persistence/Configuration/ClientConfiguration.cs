using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoftBridge.Domain.Models.AccountAggregates;

namespace SoftBridge.Persistence.Configuration;

public class ClientConfiguration : IEntityTypeConfiguration<Client>
{
    public void Configure(EntityTypeBuilder<Client> builder)
    {
        builder.HasKey(x => x.Id);

        builder.ToTable("Clients");

        builder.Property(x => x.ProfileImageUrl)
            .HasMaxLength(750);

        builder.HasQueryFilter(x => !x.IsDeleted);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.HasOne(x => x.User)
            .WithOne(x => x.ClientProfile)
            .HasForeignKey<Client>(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.UserId)
            .IsUnique();
    }
}
