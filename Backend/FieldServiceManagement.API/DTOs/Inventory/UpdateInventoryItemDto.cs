using System.ComponentModel.DataAnnotations;

namespace FieldServiceManagement.API.DTOs.Inventory;

public class UpdateInventoryItemDto
{
    [Required]
    [StringLength(100)]
    public string SKU { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Category { get; set; }

    [Range(0, int.MaxValue)]
    public int QuantityInStock { get; set; }

    [Range(0, int.MaxValue)]
    public int ReorderLevel { get; set; }

    [Range(0, 999999999)]
    public decimal UnitPrice { get; set; }
}