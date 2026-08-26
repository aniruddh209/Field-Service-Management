using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FieldServiceManagement.API.Models;

public class InventoryItem
{
    [Key]
    public int Id { get; set; }

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