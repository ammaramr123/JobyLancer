using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;

namespace SoftBridge.Domain.Contracts.SpecificationPattern
{
    // enable multi-level ordering in the specifications
    // like Orderby x => x.Name ascending and then by x => x.Price descending
    public class OrderExpressionInfo<TEntity>
    {
        // this class is used to store the order expression
        // and the order type (ascending or descending)
        // for example if we want to order by name ascending we will have:
        // OrderExpression = x => x.Name
        // IsDescending = false
        // it returns a list of OrderExpressionInfo in the specifications to order the results
        // like : Orderby x => x.Name ascending and then by x => x.Price descending  
        public Expression<Func<TEntity,object>>? OrderExpression { get; set; }
        public bool IsDescending { get; set; }
    }
}
