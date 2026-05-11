using System;
using System.ComponentModel.DataAnnotations;

namespace SoftBridge.Shared.Common.Dto.Category;

public class CategoryToCreateDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Url]
    public string IconUrl { get; set; } = string.Empty;
}
