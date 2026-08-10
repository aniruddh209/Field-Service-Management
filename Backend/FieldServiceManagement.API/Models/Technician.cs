using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FieldServiceManagement.API.Models;

public class Technician
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [Required]
    [StringLength(20)]
    public string EmployeeCode { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Specialization { get; set; } = string.Empty;

    [Range(0, 40)]
    public int ExperienceYears { get; set; }

    [Range(0, 5)]
    [Column(TypeName = "decimal(3,2)")]
    public decimal Rating { get; set; } = 5;

    public int TotalJobs { get; set; }

    public int ActiveJobs { get; set; }

    public int CompletedJobs { get; set; }

    public bool IsAvailable { get; set; } = true;

    public bool IsActive { get; set; } = true;

    [StringLength(100)]
    public string? CurrentLocation { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
    
    [Required]
    [StringLength(30)]
    public string Status { get; set; } = "Available";

    public DateTime JoiningDate { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<ServiceRequest> ServiceRequests { get; set; }
        = new List<ServiceRequest>();
}