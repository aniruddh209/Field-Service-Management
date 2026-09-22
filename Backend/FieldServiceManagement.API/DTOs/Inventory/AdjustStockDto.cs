namespace FieldServiceManagement.API.DTOs.Inventory;

public class AdjustStockDto
{
    public int QuantityChange { get; set; }

    public string? Reason { get; set; }
}