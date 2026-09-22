using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FieldServiceManagement.API.Models;

public class InvoiceItem
{
    [Key]
    public int Id { get; set; }

    public int InvoiceId { get; set; }

    [ForeignKey(nameof(InvoiceId))]
    public Invoice? Invoice { get; set; }

    public int? InventoryItemId { get; set; }

    [ForeignKey(nameof(InventoryItemId))]
    public InventoryItem? InventoryItem { get; set; }

    public string ItemName { get; set; } = string.Empty;

    public string? SKU { get; set; }

    public int Quantity { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalPrice { get; set; }
}