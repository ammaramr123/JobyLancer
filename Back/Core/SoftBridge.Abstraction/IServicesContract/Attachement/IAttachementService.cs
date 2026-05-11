using SoftBridge.Shared.Common.Dto.Attachement;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace SoftBridge.Abstraction.IServices.Attachement
{
    // it will help any other service that needs to handle the attachments to do it in a unified way,
    // and it will be used by the provider and client profiles services to handle the profile picture and the cover picture,
    // and it can be used by any other service that needs to handle the attachments of the providers and clients;
    public interface IAttachmentService
    {
        // Uploads a file and returns the relative file path (URL) to be saved in the database
        Task<string> UploadFileAsync(UploadFileDto uploadFileDto);

        // Deletes a file from the server given its relative path
        Task<bool> DeleteFileAsync(string filePath);
    }
}
