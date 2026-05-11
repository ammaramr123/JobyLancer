using SoftBridge.Domain.Models.User;
using System;

namespace SoftBridge.Domain.Models.Shared;

public class Notification : BaseEntity<Guid>
{
    public string UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public Guid? ReferenceId { get; set; }

    // Navigation property
    public ApplicationUser User { get; set; } = null!;
}
