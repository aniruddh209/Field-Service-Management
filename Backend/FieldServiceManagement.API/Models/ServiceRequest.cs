using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FieldServiceManagement.API.Models;

public class ServiceRequest
{
    [Key]
    public int Id { get; set; }


    // =========================================================
    // FOREIGN KEYS
    // =========================================================

    [Required]
    public int CustomerId { get; set; }

    [Required]
    public int ServiceId { get; set; }

    // Technician is optional because a request
    // can exist before a technician is assigned.
    public int? TechnicianId { get; set; }

    // Asset is optional because a customer may create
    // a service request without selecting an asset.
    public int? AssetId { get; set; }


    // =========================================================
    // REQUEST DETAILS
    // =========================================================

    [Required]
    [StringLength(500, MinimumLength = 10)]
    public string ProblemDescription { get; set; } = string.Empty;

    [Required]
    [StringLength(300)]
    public string ServiceAddress { get; set; } = string.Empty;

    [Required]
    public DateTime PreferredDate { get; set; }

    [Required]
    [StringLength(30)]
    public string Status { get; set; } = "Pending";

    [Column(TypeName = "decimal(10,2)")]
    public decimal EstimatedPrice { get; set; } = 0;

    [StringLength(500)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }


    // =========================================================
    // NAVIGATION PROPERTIES
    // =========================================================

    // Customer
    [ForeignKey(nameof(CustomerId))]
    public User Customer { get; set; } = null!;


    // Service
    [ForeignKey(nameof(ServiceId))]
    public Service Service { get; set; } = null!;


    // Technician
    [ForeignKey(nameof(TechnicianId))]
    public Technician? Technician { get; set; }


    // Asset
    [ForeignKey(nameof(AssetId))]
    public Asset? Asset { get; set; }
}