namespace FieldServiceManagement.API.DTOs.Inventory;

public class UpdateInventoryItemDto
{
    public string SKU { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Category { get; set; }

    public int QuantityInStock { get; set; }

    public int ReorderLevel { get; set; }

    public decimal UnitPrice { get; set; }
}