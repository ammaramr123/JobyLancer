using SoftBridge.Domain.Contracts;

using Microsoft.AspNetCore.Identity;
using SoftBridge.Domain.Contracts;
using SoftBridge.Domain.Models.AccountAggregates;
using SoftBridge.Domain.Models.EnumHelper;
using SoftBridge.Domain.Models.Shared;

namespace SoftBridge.Domain.Models.User
{
    public class ApplicationUser : IdentityUser, IEntity<string>
    {
        public string FullName { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public UserType UserType { get; set; }
        public DateTime LastLoginAt { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public virtual Client? ClientProfile { get; set; }
        public virtual SProvider? ProviderProfile { get; set; }
        public virtual ICollection<Message> SentMessages { get; set; } = new HashSet<Message>();
        public virtual ICollection<Message> ReceivedMessages { get; set; } = new HashSet<Message>();
        public virtual ICollection<Notification> Notifications { get; set; } = new HashSet<Notification>();
    }
}
