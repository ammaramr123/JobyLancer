using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoftBridge.Domain.Models.ServiceAggregates;
using System;
using System.Collections.Generic;
using System.Text;

namespace SoftBridge.Persistence.Configuration
{
    public class CategoryConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                   .HasDefaultValueSql("NEWID()");

            builder.Property(x => x.Name)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.HasIndex(c => c.Name)
                .HasFilter("[IsDeleted] = 0");

            builder.Property(c => c.CreatedAt)
               .IsRequired()
               .HasDefaultValueSql("GETUTCDATE()");

            builder.HasQueryFilter(c => !c.IsDeleted);

            builder.ToTable("Categories");
        }
    }
}
