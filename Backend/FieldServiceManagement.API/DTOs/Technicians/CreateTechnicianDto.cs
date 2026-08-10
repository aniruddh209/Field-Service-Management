using System.ComponentModel.DataAnnotations;

namespace FieldServiceManagement.API.DTOs.Technicians;

public class CreateTechnicianDto
{
    [Required]
    public int UserId { get; set; }

    [Required]
    [StringLength(20)]
    public string EmployeeCode { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Specialization { get; set; } = string.Empty;

    [Range(0, 40)]
    public int ExperienceYears { get; set; }

    [StringLength(100)]
    public string? CurrentLocation { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}