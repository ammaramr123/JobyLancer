
﻿using SoftBridge.Domain.Models.AccountAggregates;
using SoftBridge.Domain.Models.EnumHelper;
using SoftBridge.Domain.Models.ServiceAggregates;
using SoftBridge.Domain.Models.Shared;


namespace SoftBridge.Domain.Models.OrderAggregates
{
    public class ServiceRequest: BaseEntity<Guid>
    {
        public Guid ServiceId { get; set; }
        public Guid ClientId { get; set; }
        public Guid ProviderId { get; set; }
        public string Message { get; set; } = string.Empty;
        public decimal AgreedPrice { get; set; }
        public RequestStatus Status { get; set; } = RequestStatus.Pending;
        public string? RejectionReason { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public virtual Service Service { get; set; } = null!;
        public virtual Client Client { get; set; } = null!;
        public virtual SProvider Provider { get; set; } = null!;
        public virtual Review? Review { get; set; }
        public virtual ICollection<Message> Messages { get; set; } = new HashSet<Message>();

    }
}
