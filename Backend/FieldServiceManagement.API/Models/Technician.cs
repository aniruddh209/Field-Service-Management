using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FieldServiceManagement.API.Models;

public class Technician
{
    [Key]
    public int Id { get; set; }

    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    public string EmployeeCode { get; set; } = string.Empty;

    public string Specialization { get; set; } = string.Empty;

    public int ExperienceYears { get; set; }

    [Column(TypeName = "decimal(3,2)")]
    public decimal Rating { get; set; } = 5;

    public int TotalJobs { get; set; }

    public int ActiveJobs { get; set; }

    public int CompletedJobs { get; set; }

    public bool IsAvailable { get; set; } = true;

    public bool IsActive { get; set; } = true;

    public string? CurrentLocation { get; set; }

    public string? Notes { get; set; }

    public string Status { get; set; } = "Available";

    public DateTime JoiningDate { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<ServiceRequest> ServiceRequests { get; set; }
        = new List<ServiceRequest>();
}