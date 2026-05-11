using SoftBridge.Domain.Models.Shared;
using System;

namespace SoftBridge.Domain.Models.ServiceAggregates;

public class Category : BaseEntity<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    //Navigation with Services ( a category can have many services and a service belongs to one category)
    public ICollection<Service> Services { get; set; } = new HashSet<Service>();
}
