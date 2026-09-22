namespace FieldServiceManagement.API.DTOs.ServiceRequests;

public class CreateServiceRequestDto
{
    public int ServiceId { get; set; }

    public string ProblemDescription { get; set; } = string.Empty;

    public string ServiceAddress { get; set; } = string.Empty;

    public DateTime PreferredDate { get; set; }

    public string? Notes { get; set; }
}