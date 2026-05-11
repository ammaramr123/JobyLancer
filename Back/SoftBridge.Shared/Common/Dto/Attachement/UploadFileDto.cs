using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace SoftBridge.Shared.Common.Dto.Attachement
{
    public class UploadFileDto
    {
        public IFormFile File { get; set; } = null!;

        // wwwroot ( "Images/Profiles" or "Documents/CVs")
        public string FolderName { get; set; } = null!;
    }
}
