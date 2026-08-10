using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FieldServiceManagement.API.Models;

public class ServiceRequest
{
    [Key]
    public int Id { get; set; }

    // Foreign Keys

    [Required]
    public int CustomerId { get; set; }

    [Required]
    public int ServiceId { get; set; }

    public int? TechnicianId { get; set; }

    // Request Details

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

    // Navigation Properties

    [ForeignKey(nameof(CustomerId))]
    public User Customer { get; set; } = null!;

    [ForeignKey(nameof(ServiceId))]
    public Service Service { get; set; } = null!;

    [ForeignKey(nameof(TechnicianId))]
    public Technician? Technician { get; set; }
}