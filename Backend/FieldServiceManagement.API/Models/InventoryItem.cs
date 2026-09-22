using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FieldServiceManagement.API.Models;

public class InventoryItem
{
    [Key]
    public int Id { get; set; }

    public string SKU { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Category { get; set; }

    public int QuantityInStock { get; set; }

    public int ReorderLevel { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<WorkReportPart> WorkReportParts { get; set; }
        = new List<WorkReportPart>();
    public ICollection<StockMovement> StockMovements { get; set; }
        = new List<StockMovement>();
}