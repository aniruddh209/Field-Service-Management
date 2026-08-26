namespace FieldServiceManagement.API.DTOs.ServiceRequests;

public class ServiceRequestDashboardDto
{
    public int TotalRequests { get; set; }

    public int PendingRequests { get; set; }

    public int AssignedRequests { get; set; }

    public int InProgressRequests { get; set; }

    public int CompletedRequests { get; set; }

    public int CancelledRequests { get; set; }
}