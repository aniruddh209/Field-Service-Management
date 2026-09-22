namespace FieldServiceManagement.API.DTOs.Invoices;

public class InvoiceItemDto
{
    public int Id { get; set; }

    public int? InventoryItemId { get; set; }

    public string ItemName { get; set; } = string.Empty;

    public string? SKU { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal TotalPrice { get; set; }
}