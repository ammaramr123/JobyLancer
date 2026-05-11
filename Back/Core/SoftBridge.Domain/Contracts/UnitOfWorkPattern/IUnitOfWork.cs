
﻿using SoftBridge.Domain.Contracts;
using SoftBridge.Domain.Contracts.GenericReposPattern;


namespace SoftBridge.Domain.Contracts.UnitOfWorkPattern
{
    // The IUnitOfWork interface defines a contract for a unit of work pattern,
    // which is a design pattern used to manage database transactions used when
    // working with multiple repositories.
    // It provides a way to group multiple operations into a single transaction.
    public interface IUnitOfWork : IAsyncDisposable
    // IAsyncDisposable is used to close the database connection when
    // the unit of work is disposed, ensuring that resources are released properly.
    {
        IGenericRepo<TEntity, TKey> GetRepository<TEntity, TKey>() where TEntity : class , IEntity<TKey>;
        // the most important method in the unit of work pattern,
        // it is responsible for saving all changes made to the database in a single transaction.
        Task<int> SaveChangesAsync();
    }
}
