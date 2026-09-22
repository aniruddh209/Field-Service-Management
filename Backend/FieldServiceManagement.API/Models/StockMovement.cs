using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FieldServiceManagement.API.Models;

public class StockMovement
{
    [Key]
    public int Id { get; set; }

    public int InventoryItemId { get; set; }

    [ForeignKey(nameof(InventoryItemId))]
    public InventoryItem InventoryItem { get; set; } = null!;

    public int QuantityChange { get; set; }

    public int QuantityAfterChange { get; set; }

    public string? Reason { get; set; }

    public int? UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}