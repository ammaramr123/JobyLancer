using System;
using System.Collections.Generic;
using System.Text;
using SoftBridge.Shared.Common.Dto.Category;
using SoftBridge.Shared.Common.Pagination;
using SoftBridge.Shared.Common.Params.Category;

namespace SoftBridge.Abstraction.IServices.Category
{
    // used for admin only to manage the categories which the providers will be categorized under it,
    // and the clients will search for providers based on these categories
    public interface ICategoryService
    {
        /// <summary>
        /// Gets all categories.
        /// </summary>
        /// <returns></returns>
        Task<PaginationResponse<CategoryDto>> GetAllCategoriesAsync(CategoryQueryParams parameters);

        /// <summary>
        /// Gets a category by its ID.
        /// </summary>
        /// <param name="id">The ID of the category to retrieve.</param>
        /// <returns>The category DTO if found, otherwise null.</returns>
    
        Task<CategoryWithServicesDto> GetCategoryByIdAsync(Guid id);


        /// <summary>
        /// Creates a new category.
        /// </summary>
        /// <param name="categoryDto">The category DTO to create.</param>
        /// <returns>The created category DTO.</returns>
        
         Task<CategoryDto> CreateCategoryAsync(CategoryToCreateDto categoryDto);

         
        /// <summary>
        /// Updates an existing category.
        /// </summary>
        /// <param name="id">The ID of the category to update.</param>
        /// <param name="categoryDto">The category DTO with updated information.</param>
        /// <returns>The updated category DTO.</returns>
        
        Task<CategoryDto> UpdateCategoryAsync(Guid id, CategoryToUpdateDto categoryDto);


        /// <summary>
        /// Deletes a category by its ID.
        /// </summary>
        /// <param name="id">The ID of the category to delete.</param>
        /// <returns>A boolean indicating whether the deletion was successful.</returns>
        
        Task<bool> DeleteCategoryAsync(Guid id);
    }
}
