using System;
using System.Collections.Generic;
using System.Text;

namespace SoftBridge.Shared.Common.Pagination
{
    public class PaginationResponse<TData>
    {
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public int TotalItems { get; set; } // total items in the database get from the method that return the count of items in the database
        public IReadOnlyList<TData> Data { get; set; }
        public PaginationResponse(int index , int size , int count ,IReadOnlyList<TData> data)
        {
            PageIndex = index;
            PageSize = size;
            TotalItems = count;
            Data = data;
        }
    }
}
