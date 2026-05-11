using System;
using SoftBridge.Domain.Contracts.Specifications.BaseSpec;
using SoftBridge.Shared.Common.Params.Category;
using MailKit.Search;
using SoftBridge.Domain.Models.ServiceAggregates;

namespace SoftBridge.Services.Specification.CategorySpecifications.GetAllCategoriesAsync;

public class CategoryFiltrationSpecification : BaseSpecifications<Category, Guid>
{
    public CategoryFiltrationSpecification(CategoryQueryParams categoryParams) : base(c =>
        (!categoryParams.IsActive.HasValue || c.IsActive == categoryParams.IsActive.Value) &&
        (string.IsNullOrEmpty(categoryParams.Search) || c.Name.ToLower().Contains(categoryParams.Search))
    )
    {
        ApplyPagenation(categoryParams.PageSize, categoryParams.PageIndex);
        AddOrderBy(c => c.CreatedAt);
    }
}
