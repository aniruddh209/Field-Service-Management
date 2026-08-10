namespace FieldServiceManagement.API.DTOs.ServiceRequests;

public class ServiceRequestDto
{
    public int Id { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public string ServiceName { get; set; } = string.Empty;

    public string? TechnicianName { get; set; }

    public string ProblemDescription { get; set; } = string.Empty;

    public string ServiceAddress { get; set; } = string.Empty;

    public DateTime PreferredDate { get; set; }

    public string Status { get; set; } = string.Empty;

    public decimal EstimatedPrice { get; set; }
}