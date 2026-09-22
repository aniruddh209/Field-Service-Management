using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FieldServiceManagement.API.Models;

public class ServiceRequest
{
    [Key]
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public int ServiceId { get; set; }

    public int? TechnicianId { get; set; }

    public int? AssetId { get; set; }

    public string ProblemDescription { get; set; } = string.Empty;

    public string ServiceAddress { get; set; } = string.Empty;

    public DateTime PreferredDate { get; set; }

    public string Status { get; set; } = "Pending";

    [Column(TypeName = "decimal(10,2)")]
    public decimal EstimatedPrice { get; set; } = 0;

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    [ForeignKey(nameof(CustomerId))]
    public User Customer { get; set; } = null!;

    [ForeignKey(nameof(ServiceId))]
    public Service Service { get; set; } = null!;

    [ForeignKey(nameof(TechnicianId))]
    public Technician? Technician { get; set; }

    [ForeignKey(nameof(AssetId))]
    public Asset? Asset { get; set; }
}