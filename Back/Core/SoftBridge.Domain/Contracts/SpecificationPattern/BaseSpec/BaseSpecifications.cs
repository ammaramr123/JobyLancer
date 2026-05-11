using SoftBridge.Domain.Contracts;
using SoftBridge.Domain.Contracts.SpecificationPattern;
using System.Linq.Expressions;

namespace SoftBridge.Domain.Contracts.Specifications.BaseSpec
{
    // DRY Principle : this is the porpose of this class to avoid code duplication in the specifications classes
    // example : if we not create this class we will have to implement the ISpecifications interface in each specifications class and we will have to implement
    // the properties and methods in each specifications class which will cause code duplication
    // and if we want to change the implementation of the properties and methods in the future
    // we will have to change it in all specifications classes which will cause a lot of work and errors
    // but if we create this class and implement the ISpecifications interface in it and then inherit from this class in the specifications classes
    // abstract because we don't want to create an instance of this class directly we want to create an instance of the specifications classes that inherit from this class
    public abstract class BaseSpecifications<TEntity,TKey> 
        : ISpecifications<TEntity, TKey> where TEntity : class, IEntity<TKey>
    {
        // protected Empty constructor because if we need to create a specifications class
        // without criteria we can use this constructor and it will return all records
        // because the default criteria is Entity => true
        // so if we need to get all  records with join and pagenation without ant where like getAllAsync
        // we can use this constructor and then add the includes and order by and pagenation in the specifications class
        protected BaseSpecifications()
        {
            // default criteria to return all records if no criteria
            // is provided in the specifications classes
            Criteria = Entity => true; 
        }

        #region Apply Criteria
        // Criteria is the where clause in the specifications return true or false
        // private set because we want to set it in the constructor and we don't want to change it later
        public Expression<Func<TEntity, bool>> Criteria { get; private set; }
        public BaseSpecifications(Expression<Func<TEntity, bool>> _criteria)
          => Criteria = _criteria;
        #endregion

        #region Apply Includes
        // Includes is the include clause in the specifications to include related entities return a list of expressions like x => x.Category
        // initialize it with an empty list to avoid null reference exception when we want to add includes in the specifications classes
        // private set because we want to set it in the constructor and we don't want to change it later
        public List<Expression<Func<TEntity, object>>> Includes { get; private set; } = new List<Expression<Func<TEntity, object>>>();

        // this method is used to add include expressions to the specifications classes
        protected void AddInclude(Expression<Func<TEntity, object>> includeExpression )
            => Includes.Add(includeExpression);
        #endregion

        #region Example Why use IncludeStrings
        /*
            we need to use nested joins in the query 
            => the normal is  : 
            var cart = await _context.ShoppingCarts
                         .Include(c => c.CartItems)
                         .FirstOrDefaultAsync(c => c.Id == id);
            Query : SELECT * FROM ShoppingCarts c
                    LEFT JOIN CartItems i ON c.Id = i.ShoppingCartId
                    WHERE c.Id = @id
            => Ef core has an thenInclude so we need to implement this method here why ? 
            var cart = await _context.ShoppingCarts
                         .Include(c => c.CartItems)           // هات العناصر
                            .ThenInclude(i => i.ProductVariant) // وبعدين من جوه العناصر هات المتغير
                                .ThenInclude(v => v.Product)    // وبعدين من جوه المتغير هات المنتج
                         .FirstOrDefaultAsync(c => c.Id == id);
            Query : SELECT * FROM ShoppingCarts c
                    LEFT JOIN CartItems i ON c.Id = i.ShoppingCartId
                    LEFT JOIN ProductVariants v ON i.ProductVariantId = v.Id
                    LEFT JOIN Products p ON v.ProductId = p.Id
                    WHERE c.Id = @id

            BUT THE normal include method will not work because it will only include the first level of related entities
            and it will not include the nested related entities
            
            so EF Core provides =>  .Include("CartItems.ProductVariant.Product") you tell him 
            get the cart and include the cart items and for each cart item include the product variant and for each product variant include the product
            Ef convert it to => 
            .Include(c => c.CartItems).ThenInclude(i => i.ProductVariant).ThenInclude(v => v.Product)
         */
        #endregion

        #region Apply Nested Includes
        public List<string> IncludeStrings { get; private set; } = new List<string>();
        protected void AddInclude(string includeString)
            => IncludeStrings.Add(includeString);

        #endregion
        #region Apply OrderBy
        // OrderExpressionInfo is the order by clause in the specifications to order the results
        // initialize it with an empty list to avoid null reference exception when we want to add order expressions in the specifications classes
        // private set because we want to set it in the constructor and we don't want to change it later
        public List<OrderExpressionInfo<TEntity>> OrderExpressionInfo { get; private set; } = new List<OrderExpressionInfo<TEntity>>();

        // this method is used to add order expressions to the specifications classes
        protected void AddOrderBy(Expression<Func<TEntity, object>> orderByExpression, bool isDescending = false)
            => OrderExpressionInfo.Add(new OrderExpressionInfo<TEntity>
            {
                OrderExpression = orderByExpression,
                IsDescending = isDescending
            });
        #endregion

        #region Apply Pagenation
        // pagenation properties
        public int Take { get; private set; }
        public int Skip { get; private set; }
        public bool IsPagenationEnabled { get; private set; } = false;


        // this method is used to apply pagenation to the specifications classes
        protected void ApplyPagenation(int pageSize, int pageIndex)
        {
            Skip = (pageIndex - 1) * pageSize ;
            Take = pageSize;
            IsPagenationEnabled = true;
        }
        #endregion
    }
}
