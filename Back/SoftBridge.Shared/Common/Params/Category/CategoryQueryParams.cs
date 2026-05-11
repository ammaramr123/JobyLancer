using System;
using SoftBridge.Shared.Common.Params;

namespace SoftBridge.Shared.Common.Params.Category;

public class CategoryQueryParams : BaseQueryParams
{
    public string? Name { get; set; }
    public bool? IsActive { get; set; }
}
