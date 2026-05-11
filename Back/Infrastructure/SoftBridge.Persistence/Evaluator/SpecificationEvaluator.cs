using SoftBridge.Domain.Contracts;
using Microsoft.EntityFrameworkCore;
using SoftBridge.Domain.Contracts;
using SoftBridge.Domain.Contracts.SpecificationPattern;


namespace SoftBridge.Persistence.Evaluator
{
    public static class SpecificationEvaluator
    {
        public static IQueryable<TEntity> GenerateQuery<TEntity,TKey>
            (IQueryable<TEntity> BaseQuery, ISpecifications<TEntity,TKey> specification)
            where TEntity : class , IEntity<TKey>
        {
            var query = BaseQuery;
            if (specification.Criteria != null)
                query = query.Where(specification.Criteria);

            if (specification.Includes is not null && specification.Includes.Any())
                query =specification.Includes.Aggregate(query, (current, Expression) => current.Include(Expression));
            
            // after end the basic include we need to apply the then include
            if (specification.IncludeStrings.Count > 0)
                query = specification.IncludeStrings.Aggregate(query, (current, includeString) => current.Include(includeString));
            
            if (specification.OrderExpressionInfo is not null && specification.OrderExpressionInfo.Any())
            {
                // 1- Apply the first order by
                var firstOrder = specification.OrderExpressionInfo.First();

                IOrderedQueryable<TEntity> orderedQuery = firstOrder.IsDescending
                    ? query.OrderByDescending(firstOrder.OrderExpression!)
                    : query.OrderBy(firstOrder.OrderExpression!);

                for (int i = 1; i < specification.OrderExpressionInfo.Count; i++)
                {
                    var nextSort = specification.OrderExpressionInfo[i];

                    orderedQuery = nextSort.IsDescending
                        ? orderedQuery.ThenByDescending(nextSort.OrderExpression!)
                        : orderedQuery.ThenBy(nextSort.OrderExpression!);
                    
                }
                
                query = orderedQuery;
            }

            if (specification.IsPagenationEnabled)
                query = query.Skip(specification.Skip).Take(specification.Take);

            return query;
        }
    }
}
