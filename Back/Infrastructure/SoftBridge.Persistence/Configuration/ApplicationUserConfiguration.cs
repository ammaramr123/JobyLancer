using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoftBridge.Domain.Models.AccountAggregates;
using SoftBridge.Domain.Models.User;

namespace SoftBridge.Persistence.Configuration;

public class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.Property(x => x.FullName)
            .HasMaxLength(200);

        builder.Property(x => x.IsActive)
            .HasDefaultValue(true);

        builder.Property(x => x.UserType)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(x => x.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.LastLoginAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(x => x.IsActive);
        builder.HasIndex(x => x.CreatedAt);
    }
}
