using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SoftBridge.Domain.Models.Shared;
using System;
using System.Collections.Generic;
using System.Text;

namespace SoftBridge.Persistence.Configuration
{
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                   .HasDefaultValueSql("NEWID()");

            builder.Property(x => x.CreatedAt)
               .IsRequired()
               .HasDefaultValueSql("GETUTCDATE()");

            builder.HasQueryFilter(n => !n.IsDeleted);

            builder.HasOne(n => n.User)
               .WithMany(u => u.Notifications)
               .HasForeignKey(n => n.UserId)
               .OnDelete(DeleteBehavior.Cascade);

            builder.ToTable("Notifications");

        }
    }
}
