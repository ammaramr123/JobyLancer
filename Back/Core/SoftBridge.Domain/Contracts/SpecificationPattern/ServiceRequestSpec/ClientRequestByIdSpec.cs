using SoftBridge.Domain.Contracts.Specifications.BaseSpec;
using SoftBridge.Domain.Models.OrderAggregates;
using System;
using System.Collections.Generic;
using System.Text;

namespace SoftBridge.Domain.Contracts.SpecificationPattern.ServiceRequestSpec
{
    // Returns a SINGLE request — validates it belongs to the client
    public class ClientRequestByIdSpec: BaseSpecifications<ServiceRequest, Guid>
    {
        public ClientRequestByIdSpec(Guid requestId, Guid clientId)
            : base(x => x.Id == requestId && x.ClientId == clientId && !x.IsDeleted)
        {
            AddInclude(c => c.Service);
            AddInclude(c => c.Provider);
            AddInclude(c => c.Provider.User);
            AddInclude(c => c.Review);
            //AddInclude("Review");
        }
    }
}
