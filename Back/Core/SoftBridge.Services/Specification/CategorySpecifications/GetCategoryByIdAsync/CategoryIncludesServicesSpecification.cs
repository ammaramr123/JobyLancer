    using System;
    using SoftBridge.Domain.Contracts.Specifications.BaseSpec;
    using SoftBridge.Domain.Models.ServiceAggregates;

    namespace SoftBridge.Services.Specification.CategorySpecifications.GetCategoryByIdAsync;

    public class CategoryIncludesServicesSpecification : BaseSpecifications<Category, Guid>
    {
        public CategoryIncludesServicesSpecification(Guid categoryId) : base(c => c.Id == categoryId)
        {
            AddInclude(c => c.Services);
        }
    }
