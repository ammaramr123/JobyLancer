using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Org.BouncyCastle.Math.EC.Rfc7748;
using SoftBridge.Domain.Models.ServiceAggregates;
using System;
using System.Collections.Generic;
using System.Text;
//using IServiceProvider =  SoftBridge.Domain.Models.AccountAggregates.SProvider;

namespace SoftBridge.Persistence.Configuration
{
    public class ServiceConfiguration : IEntityTypeConfiguration<Service>
    {
        public void Configure(EntityTypeBuilder<Service> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(i => i.Id)
               .HasDefaultValueSql("NEWID()");

            builder.Property(x => x.Title)
                .IsRequired()
                .HasMaxLength(250);

            builder.Property(s => s.Price)
                .HasColumnType("decimal(18,2)")
                .IsRequired();

            builder.HasQueryFilter(s => !s.IsDeleted);

            builder.Property(s => s.Status)
               .IsRequired()
               .HasConversion<string>()
               .HasMaxLength(30);

            builder.HasIndex(x => x.Status)
                .HasFilter("[IsDeleted] = 0");

            builder.Property(s => s.CreatedAt)
               .IsRequired()
               .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(s => s.IsDeleted)
               .IsRequired()
               .HasDefaultValue(false);

            builder.HasOne(x => x.Provider)
                .WithMany(x => x.Services)
                .HasForeignKey(x => x.ProviderId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Category)
                .WithMany(x => x.Services)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.Images)
               .WithOne(x => x.Service)
               .HasForeignKey(x => x.ServiceId)
               .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(s => s.ServiceRequests)
               .WithOne(r => r.Service)
               .HasForeignKey(r => r.ServiceId)
               .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(s => s.Reviews)
               .WithOne()
               .HasForeignKey(r => r.ServiceId)
               .OnDelete(DeleteBehavior.Restrict);

            builder.ToTable("Services");

        }
    }
}
