using System;
using SoftBridge.Domain.Models.AccountAggregates;
using SoftBridge.Domain.Models.EnumHelper;
using SoftBridge.Domain.Models.OrderAggregates;
using SoftBridge.Domain.Models.Shared;

namespace SoftBridge.Domain.Models.ServiceAggregates;

public class Service : BaseEntity<Guid>
{
    public Guid ProviderId { get; set; }
    public Guid CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int DeliveryDays { get; set; }
    public ServiceStatus Status { get; set; } = ServiceStatus.Pending;
    public string? RejectionReason { get; set; }
    public float AverageRating { get; set; } = 0f; // store this in DB to avoid calculating it every time, update it when a new review is added

    // Navigation properties
    public SProvider Provider { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public ICollection<ServiceImage> Images { get; set; } = new HashSet<ServiceImage>();
    public ICollection<ServiceRequest> ServiceRequests { get; set; } = new HashSet<ServiceRequest>();
    public ICollection<Review> Reviews { get; set; } = new HashSet<Review>();
}
