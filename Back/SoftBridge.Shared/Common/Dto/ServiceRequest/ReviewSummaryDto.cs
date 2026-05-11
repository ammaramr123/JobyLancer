using System;
using System.Collections.Generic;
using System.Text;

namespace SoftBridge.Shared.Common.Dto.ServiceRequest
{
    public class ReviewSummaryDto
    {
        public Guid Id { get; set; }
        public byte Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
