using SoftBridge.Domain.Contracts.Specifications.BaseSpec;
using SoftBridge.Domain.Models.OrderAggregates;
using System;
using System.Collections.Generic;
using System.Text;

namespace SoftBridge.Domain.Contracts.SpecificationPattern.ServiceRequestSpec
{
    public class ClientRequestsSpec: BaseSpecifications<ServiceRequest, Guid>
    {
        // Returns ALL requests belonging to a client — includes Service, Provider, Review
        public ClientRequestsSpec(Guid clientId)
            :base(x => x.ClientId == clientId && !x.IsDeleted)
        {
            AddInclude(r => r.Service);
            AddInclude(r => r.Provider);
            AddInclude(r => r.Provider.User);

            // nested include: ServiceRequest → Review (one-to-one)
            AddInclude(r => r.Review);
            //AddInclude("Review");

            AddOrderBy(r => r.CreatedAt, true);


        }
    }
}
