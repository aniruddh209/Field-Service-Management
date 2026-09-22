using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FieldServiceManagement.API.Models;

public class WorkReportPart
{
    [Key]
    public int Id { get; set; }

    public int WorkReportId { get; set; }

    [ForeignKey(nameof(WorkReportId))]
    public WorkReport WorkReport { get; set; } = null!;

    public int InventoryItemId { get; set; }

    [ForeignKey(nameof(InventoryItemId))]
    public InventoryItem InventoryItem { get; set; } = null!;

    public int Quantity { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalPrice { get; set; }
}