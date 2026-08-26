using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FieldServiceManagement.API.Models;

public class StockMovement
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int InventoryItemId { get; set; }

    [ForeignKey(nameof(InventoryItemId))]
    public InventoryItem InventoryItem { get; set; } = null!;

    [Required]
    public int QuantityChange { get; set; }

    [Required]
    public int QuantityAfterChange { get; set; }

    [StringLength(500)]
    public string? Reason { get; set; }

    public int? UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User? User { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}