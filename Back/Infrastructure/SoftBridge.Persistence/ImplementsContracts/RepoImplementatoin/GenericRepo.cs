
using Microsoft.EntityFrameworkCore;
using SoftBridge.Domain.Contracts;
using SoftBridge.Domain.Contracts.GenericReposPattern;
using SoftBridge.Domain.Contracts.SpecificationPattern;
using SoftBridge.Persistence;
using SoftBridge.Persistence.Evaluator;

namespace SoftBridge.Persistence.ImplementsContracts.RepoImplementatoin
{
    public class GenericRepo<TEntity, TKey>
        : IGenericRepo<TEntity, TKey> where TEntity : class, IEntity<TKey>
    {
        private readonly DbSet<TEntity> _dbSet;
        public GenericRepo(ProjectDbContext context)
        {
            _dbSet = context.Set<TEntity>();
        }
        public async Task<IReadOnlyList<TEntity>> GetAllAsync()
            => await _dbSet.AsNoTracking().ToListAsync(); // AsNoTracking() is used to improve performance when you don't need to track changes to the entities.

        public async Task<TEntity?> GetByIdAsync(TKey id)
            => await _dbSet.FindAsync(id);
        public async Task AddAsync(TEntity entity)
            => await _dbSet.AddAsync(entity);

        public void Update(TEntity entity)
            => _dbSet.Update(entity);
        public void Delete(TEntity entity)
            => _dbSet.Remove(entity);

        public async Task<IReadOnlyList<TEntity>> GetAllWithSpecAsync(ISpecifications<TEntity, TKey> specifications)
        {
            var BaseQuery = _dbSet.AsNoTracking();
            var Query = SpecificationEvaluator.GenerateQuery(BaseQuery, specifications);
            return await Query.ToListAsync();
        }
        public async Task<TEntity?> GetByIdWithSpecAsync(ISpecifications<TEntity, TKey> specifications)
        {
            var BaseQuery = _dbSet.AsNoTracking();
            var Query = SpecificationEvaluator.GenerateQuery(BaseQuery, specifications);
            return await Query.FirstOrDefaultAsync();

        }
        // this method is used to get the count of entities that match the specifications,
        // it can be used for pagination to get the total count of items in the database that match the specifications
        public async Task<int> GetCountAsync(ISpecifications<TEntity, TKey> specifications)
        {
            var BaseQuery = _dbSet.AsNoTracking();
            var Query = SpecificationEvaluator.GenerateQuery(BaseQuery, specifications);
            return await Query.CountAsync();
        }
    }
}
