using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoftBridge.Domain.Models.OrderAggregates;


namespace SoftBridge.Persistence.Configuration;

public class ServiceRequestConfiguration : IEntityTypeConfiguration<ServiceRequest>
{
    public void Configure(EntityTypeBuilder<ServiceRequest> builder)
    {
        builder.HasKey(x => x.Id);

        builder.ToTable("ServiceRequests");

        builder.Property(x => x.Message)
            .HasMaxLength(1000);
        
        builder.Property(x=>x.AgreedPrice)
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.RejectionReason)
            .HasMaxLength(500);
        
        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasIndex(x => x.Status).HasFilter("[IsDeleted] = 0"); // index on status for non-deleted requests to speed up filtering by status

        builder.HasQueryFilter(s => !s.IsDeleted);

        builder.Property(r => r.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.HasOne(x => x.Client)
            .WithMany(x => x.ServiceRequests)
            .HasForeignKey(x => x.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        // indexes for faster querying
        builder.HasIndex(x => x.ServiceId);
        builder.HasIndex(x => x.ClientId);
        builder.HasIndex(x => x.ProviderId);
    }
}