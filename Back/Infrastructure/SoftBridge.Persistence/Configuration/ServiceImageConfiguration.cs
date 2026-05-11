using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoftBridge.Domain.Models.ServiceAggregates;
using System;
using System.Collections.Generic;
using System.Text;
using SoftBridge.Domain.Models.Shared;

namespace SoftBridge.Persistence.Configuration
{
    public class ServiceImageConfiguration : IEntityTypeConfiguration<ServiceImage>
    {
        public void Configure(EntityTypeBuilder<ServiceImage> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
               .HasDefaultValueSql("NEWID()");

            builder.Property(x => x.ImageUrl)
               .IsRequired()
               .HasMaxLength(500);

            builder.Property(i => i.IsPortfolio)
               .IsRequired()
               .HasDefaultValue(false);

            builder.Property(i => i.DisplayOrder)
                   .IsRequired()
                   .HasDefaultValue(0);

            builder.Property(i => i.CreatedAt)
               .IsRequired()
               .HasDefaultValueSql("GETUTCDATE()");

            builder.HasQueryFilter(i => !i.IsDeleted);

            builder.ToTable("ServiceImages");


        }
    }
}
