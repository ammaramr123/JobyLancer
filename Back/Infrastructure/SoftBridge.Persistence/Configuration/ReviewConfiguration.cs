using System;
using SoftBridge.Domain.Contracts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoftBridge.Domain.Models.OrderAggregates;

namespace SoftBridge.Persistence.Configuration;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{

    // public Guid RequestId { get; set; }
    //     public Guid ClientId { get; set; }
    //     public Guid ProviderId { get; set; }
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.HasKey(x => x.Id);

        builder.ToTable("Reviews", 
            t => t.HasCheckConstraint("CK_Reviews_Rating", "[Rating] BETWEEN 1 AND 5"));

        builder.Property(x => x.Comment)
            .HasMaxLength(2000);

        builder.HasQueryFilter(r => !r.IsDeleted);

        builder.HasOne(r => r.ServiceRequest)
            .WithOne(sr => sr.Review)
            .HasForeignKey<Review>(r => r.RequestId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(r => r.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()")
            .ValueGeneratedOnAdd();

        builder.HasOne(r => r.Client)
            .WithMany(c => c.Reviews)
            .HasForeignKey(r => r.ClientId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(r => r.Provider)
            .WithMany(p => p.Reviews)
            .HasForeignKey(r => r.ProviderId)
            .OnDelete(DeleteBehavior.Restrict);

        // indexes for faster querying
        builder.HasIndex(r => r.RequestId);
        builder.HasIndex(r => r.ClientId);
        builder.HasIndex(r => r.ProviderId);
    }
}
