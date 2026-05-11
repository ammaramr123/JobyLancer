
using SoftBridge.Domain.Models.OrderAggregates;
using SoftBridge.Domain.Models.User;
using System;
using System.Collections.Generic;
using System.Text;

namespace SoftBridge.Domain.Models.Shared
{

    //+ServiceRequest? Request
    public class Message: BaseEntity<Guid>
    {
        public string SenderId { get; set; }
        public string ReceiverId { get; set; }
        public Guid? RequestId { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public virtual ApplicationUser Sender { get; set; } = null!;
        public virtual ApplicationUser Receiver { get; set; } = null!;
        public virtual ServiceRequest ServiceRequest { get; set; } = null!;
    }
}
