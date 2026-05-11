using SoftBridge.Domain.Contracts.Specifications.BaseSpec;
using SoftBridge.Domain.Models.AccountAggregates;
using System;
using System.Collections.Generic;
using System.Text;

namespace SoftBridge.Domain.Contracts.SpecificationPattern.ClientSpec
{
    public class ClientByIdSpec: BaseSpecifications<Client, Guid>
    {
        public ClientByIdSpec(Guid clientId)
            : base(x => x.Id == clientId && !x.IsDeleted)
        {
            AddInclude(c => c.User);
        }
    }
}
