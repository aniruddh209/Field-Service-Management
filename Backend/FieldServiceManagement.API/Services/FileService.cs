using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace FieldServiceManagement.API.Services;

public class FileService : IFileService
{
    private readonly string _webRootPath;
    private const string FilesBaseFolder = "Files";

    public FileService(IWebHostEnvironment environment)
    {
        _webRootPath = environment.WebRootPath
            ?? Path.Combine(environment.ContentRootPath, "wwwroot");

        if (!Directory.Exists(_webRootPath))
        {
            Directory.CreateDirectory(_webRootPath);
        }
    }

    public async Task<string> UploadFileAsync(IFormFile file, string subFolder)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is empty.");

        string uploadFolderPath = Path.Combine(_webRootPath, FilesBaseFolder, subFolder);

        if (!Directory.Exists(uploadFolderPath))
        {
            Directory.CreateDirectory(uploadFolderPath);
        }

        string uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        string fullPhysicalPath = Path.Combine(uploadFolderPath, uniqueFileName);

        using (var stream = new FileStream(fullPhysicalPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return Path.Combine(FilesBaseFolder, subFolder, uniqueFileName).Replace("\\", "/");
    }

    public void DeleteFile(string? relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath)) return;

        string fullPath = Path.Combine(_webRootPath, relativePath.TrimStart('/', '\\'));

        if (File.Exists(fullPath))
        {
            try
            {
                File.Delete(fullPath);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting file {fullPath}: {ex.Message}");
            }
        }
    }
}
