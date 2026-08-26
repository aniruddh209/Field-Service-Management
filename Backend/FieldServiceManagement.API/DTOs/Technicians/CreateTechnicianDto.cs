namespace FieldServiceManagement.API.DTOs.Technicians;

public class CreateTechnicianDto
{
    public int UserId { get; set; }

    public string EmployeeCode { get; set; } = string.Empty;

    public string Specialization { get; set; } = string.Empty;

    public int ExperienceYears { get; set; }

    public string? CurrentLocation { get; set; }

    public string? Notes { get; set; }
}