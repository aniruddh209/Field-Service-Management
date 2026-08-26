namespace FieldServiceManagement.API.DTOs.Technicians;

public class TechnicianDashboardDto
{
    public int TotalJobs { get; set; }

    public int ActiveJobs { get; set; }

    public int CompletedJobs { get; set; }

    public bool IsAvailable { get; set; }

    public bool IsActive { get; set; }

    public string Status { get; set; } = string.Empty;
}