using System;
using System.ComponentModel.DataAnnotations;

namespace SoftBridge.Shared.Common.Dto.Category;

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;
}
