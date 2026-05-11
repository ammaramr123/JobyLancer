using SoftBridge.Domain.Models.Shared;
using SoftBridge.Domain.Models.EnumHelper;
using SoftBridge.Domain.Models.OrderAggregates;
using SoftBridge.Domain.Models.ServiceAggregates;
using SoftBridge.Domain.Models.User;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace SoftBridge.Domain.Models.AccountAggregates
{
    //+ ICollection < Review > Reviews
    public class SProvider: BaseEntity<Guid>
    {
        public string UserId { get; set; }
        public string? Bio { get; set; } = string.Empty;
        public string? ProfileImageUrl { get; set; } = string.Empty;
        public string? CvUrl { get; set; } = string.Empty;
        public string? PortfolioLink { get; set; } = string.Empty;
        public ProviderAccountStatus Status { get; set; } = ProviderAccountStatus.Pending;
        public float AverageRating { get; set; } = 0f;
        public int TotalReviews { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string? ApproveByAdminId { get; set; } // nullable for pending providers
        public virtual ApplicationUser User { get; set; } = null!;
        public virtual ApplicationUser? ApprovedByAdmin { get; set; }
        public virtual ICollection<Service> Services { get; set; } = new HashSet<Service>();
        public virtual ICollection<ServiceRequest> ServiceRequests { get; set; } = new HashSet<ServiceRequest>();
        public virtual ICollection<Review> Reviews { get; set; } = new HashSet<Review>();
    }
}
