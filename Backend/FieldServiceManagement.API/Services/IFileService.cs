using Microsoft.AspNetCore.Http;

namespace FieldServiceManagement.API.Services;

public interface IFileService
{
    Task<string> UploadFileAsync(IFormFile file, string subFolder);
    void DeleteFile(string? relativePath);
}
