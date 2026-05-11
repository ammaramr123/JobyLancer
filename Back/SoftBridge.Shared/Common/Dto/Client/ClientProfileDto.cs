using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace SoftBridge.Shared.Common.Dto.Client
{
    public class ClientProfileDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }

        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Url]
        public string? ProfileImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
