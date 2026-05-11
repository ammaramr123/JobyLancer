using SoftBridge.Domain.Contracts;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;

namespace SoftBridge.Domain.Contracts.SpecificationPattern
{
    // why where TEntity : IEntity<TKey> ,
    // because we want to make sure that the entity has a key and we can use it in the specifications
    public interface ISpecifications<TEntity , TKey> where TEntity : IEntity<TKey>
    {
        // this is the where clause in the specifications return true or false
        Expression<Func<TEntity, bool>> Criteria { get; } 
        
        // this is the include clause in the specifications to include related entities return a list of expressions like x => x.Category
        List<Expression<Func<TEntity, object>>> Includes { get; }

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
                         .Include(c => c.CartItems)           
                            .ThenInclude(i => i.ProductVariant) 
                                .ThenInclude(v => v.Product)    
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
        List<string> IncludeStrings { get; } 

        // this is the order by clause in the specifications to order the results
        // return a list of OrderExpressionInfo which contains the expression
        // and the order type (ascending or descending)
        List<OrderExpressionInfo<TEntity>> OrderExpressionInfo { get; }

        // Pagenation properties
        int Take { get; } // how many records to take
        int Skip { get; } // how many records to skip
        bool IsPagenationEnabled { get; } // to enable or disable pagenation
    }
}
