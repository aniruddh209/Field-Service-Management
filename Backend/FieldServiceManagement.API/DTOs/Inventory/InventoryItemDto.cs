namespace FieldServiceManagement.API.DTOs.Inventory;

public class InventoryItemDto
{
    public int Id { get; set; }

    public string SKU { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Category { get; set; }

    public int QuantityInStock { get; set; }

    public int ReorderLevel { get; set; }

    public decimal UnitPrice { get; set; }

    public bool IsActive { get; set; }

    public bool IsLowStock { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}