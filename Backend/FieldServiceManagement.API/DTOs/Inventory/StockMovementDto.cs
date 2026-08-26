namespace FieldServiceManagement.API.DTOs.Inventory;

public class StockMovementDto
{
    public int Id { get; set; }

    public int InventoryItemId { get; set; }

    public string SKU { get; set; } = string.Empty;

    public string ItemName { get; set; } = string.Empty;

    public int QuantityChange { get; set; }

    public int QuantityAfterChange { get; set; }

    public string? Reason { get; set; }

    public int? UserId { get; set; }

    public string? UserName { get; set; }

    public DateTime CreatedAt { get; set; }
}