namespace FieldServiceManagement.API.DTOs.Assets;

public class CreateAssetDto
{
    public string Name { get; set; } = string.Empty;

    public string? Brand { get; set; }

    public string? Model { get; set; }

    public string? SerialNumber { get; set; }

    public string? Description { get; set; }
}