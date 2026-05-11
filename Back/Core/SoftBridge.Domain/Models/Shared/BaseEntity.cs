using SoftBridge.Domain.Contracts;
using System;
using System.Collections.Generic;
using System.Text;

namespace SoftBridge.Domain.Models.Shared
{
    public class BaseEntity<TKey> : IEntity<TKey>
    {
        public TKey Id { get; set; } = default!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }
        public string? LastModifiedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
