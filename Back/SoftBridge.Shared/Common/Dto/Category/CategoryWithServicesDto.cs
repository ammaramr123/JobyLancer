using System;
using System.ComponentModel.DataAnnotations;
using SoftBridge.Shared.Common.Dto.Service;

namespace SoftBridge.Shared.Common.Dto.Category;

public class CategoryWithServicesDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [Url]
    public string IconUrl { get; set; } = string.Empty;

    public IReadOnlyCollection<ServiceDto> Services { get; set; } = new HashSet<ServiceDto>();
}
