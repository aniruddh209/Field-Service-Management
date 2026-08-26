using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FieldServiceManagement.API.Models;

public class WorkReportPart
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int WorkReportId { get; set; }

    [ForeignKey(nameof(WorkReportId))]
    public WorkReport WorkReport { get; set; } = null!;

    [Required]
    public int InventoryItemId { get; set; }

    [ForeignKey(nameof(InventoryItemId))]
    public InventoryItem InventoryItem { get; set; } = null!;

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Range(0, 999999999)]
    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }

    [Range(0, 999999999)]
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalPrice { get; set; }
}