namespace FieldServiceManagement.API.DTOs.Technicians;

public class UpdateTechnicianDto
{
    public string Specialization { get; set; } = string.Empty;

    public int ExperienceYears { get; set; }

    public string? CurrentLocation { get; set; }

    public string? Notes { get; set; }

    public bool IsAvailable { get; set; }

    public bool IsActive { get; set; }
}