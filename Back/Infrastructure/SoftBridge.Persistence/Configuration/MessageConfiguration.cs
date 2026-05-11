using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoftBridge.Domain.Models.Shared;
using System;
using System.Collections.Generic;
using System.Text;

namespace SoftBridge.Persistence.Configuration
{
    public class MessageConfiguration : IEntityTypeConfiguration<Message>
    {
        public void Configure(EntityTypeBuilder<Message> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                   .HasDefaultValueSql("NEWID()");

            builder.Property(m => m.SentAt)
               .IsRequired()
               .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(m => m.CreatedAt)
                   .IsRequired()
                   .HasDefaultValueSql("GETUTCDATE()");

            builder.HasQueryFilter(m => !m.IsDeleted);

            builder.HasOne(m => m.Sender)
               .WithMany(u => u.SentMessages)
               .HasForeignKey(m => m.SenderId)
               .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(m => m.ServiceRequest)
       .WithMany(sr => sr.Messages)
       .HasForeignKey(m => m.RequestId)
       .OnDelete(DeleteBehavior.Cascade);

            builder.ToTable("Messages");
        }
    }
}
