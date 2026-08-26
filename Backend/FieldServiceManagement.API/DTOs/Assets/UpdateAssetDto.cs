using System.ComponentModel.DataAnnotations;

namespace FieldServiceManagement.API.DTOs.Assets;

public class UpdateAssetDto
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Brand { get; set; }

    [StringLength(100)]
    public string? Model { get; set; }

    [StringLength(100)]
    public string? SerialNumber { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }
}