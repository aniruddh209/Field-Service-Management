public class TechnicianDto
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string EmployeeCode { get; set; } = string.Empty;

    public string Specialization { get; set; } = string.Empty;

    public int ExperienceYears { get; set; }

    public decimal Rating { get; set; }

    public int TotalJobs { get; set; }

    public int ActiveJobs { get; set; }

    public int CompletedJobs { get; set; }

    public bool IsAvailable { get; set; }

    public bool IsActive { get; set; }

    public string Status { get; set; } = string.Empty;

    public string? CurrentLocation { get; set; }

    public DateTime JoiningDate { get; set; }
}