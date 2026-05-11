using SoftBridge.Domain.Models.AccountAggregates;
using SoftBridge.Domain.Models.Shared;

namespace SoftBridge.Domain.Models.OrderAggregates
{
    public class Review: BaseEntity<Guid>
    {
        public Guid RequestId { get; set; }
        public Guid ClientId { get; set; }
        public Guid ProviderId { get; set; }
        public Guid ServiceId { get; set; }
        public byte Rating { get; set; }
        public string? Comment { get; set; } = string.Empty;
        public virtual ServiceRequest ServiceRequest { get; set; } = null!;
        public virtual Client Client { get; set; } = null!;
        public virtual SProvider Provider { get; set; } = null!;
    }
}
