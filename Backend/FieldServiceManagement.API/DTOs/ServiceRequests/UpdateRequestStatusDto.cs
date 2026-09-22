namespace FieldServiceManagement.API.DTOs.ServiceRequests;

public class UpdateRequestStatusDto
{
    public string Status { get; set; } = string.Empty;

    public string? Notes { get; set; }
}