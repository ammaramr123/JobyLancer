using SoftBridge.Domain.Contracts.Specifications.BaseSpec;
using SoftBridge.Domain.Models.OrderAggregates;
using System;
using System.Collections.Generic;
using System.Text;

namespace SoftBridge.Domain.Contracts.SpecificationPattern.ServiceRequestSpec
{
    public class RequestForReviewSpec: BaseSpecifications<ServiceRequest, Guid>
    {
        // Fetches request with Review and Service included —
        // used when validating before adding a review
        public RequestForReviewSpec(Guid requestId, Guid clientId)
            : base(x => x.Id == requestId && x.ClientId == clientId && !x.IsDeleted)
        {
            AddInclude(r => r.Service);
            AddInclude(r => r.Provider);
            AddInclude(r => r.Provider.User);
            AddInclude(r => r.Review);
            //AddInclude("Review");   // check if review already exists
        }
    }
}
