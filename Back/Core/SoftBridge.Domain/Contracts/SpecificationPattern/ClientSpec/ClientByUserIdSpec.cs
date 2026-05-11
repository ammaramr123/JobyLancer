using SoftBridge.Domain.Contracts.Specifications.BaseSpec;
using SoftBridge.Domain.Models.AccountAggregates;
using System;
using System.Collections.Generic;
using System.Text;

namespace SoftBridge.Domain.Contracts.SpecificationPattern.ClientSpec
{
    public class ClientByUserIdSpec: BaseSpecifications<Client, Guid>
    {
        public ClientByUserIdSpec(string userId)
            : base(c => c.UserId == userId && !c.IsDeleted)
        {
            AddInclude(c => c.User); // so we can read FullName, Email etc.
        }
    }
}
