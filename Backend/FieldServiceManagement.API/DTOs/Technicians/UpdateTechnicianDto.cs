using System.ComponentModel.DataAnnotations;

namespace FieldServiceManagement.API.DTOs.Technicians;

public class UpdateTechnicianDto
{
    [Required]
    [StringLength(100)]
    public string Specialization { get; set; } = string.Empty;

    [Range(0, 40)]
    public int ExperienceYears { get; set; }

    [StringLength(100)]
    public string? CurrentLocation { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }

    public bool IsAvailable { get; set; }

    public bool IsActive { get; set; }
}