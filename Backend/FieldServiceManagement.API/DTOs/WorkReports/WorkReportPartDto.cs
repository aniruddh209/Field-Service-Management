namespace FieldServiceManagement.API.DTOs.WorkReports;

public class WorkReportPartDto
{
    public int InventoryItemId { get; set; }

    public string SKU { get; set; } = string.Empty;

    public string PartName { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal TotalPrice { get; set; }
}