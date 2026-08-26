using System.ComponentModel.DataAnnotations;

namespace FieldServiceManagement.API.DTOs.Inventory;

public class AdjustStockDto
{
    [Range(-999999, 999999)]
    public int QuantityChange { get; set; }

    [StringLength(500)]
    public string? Reason { get; set; }
}