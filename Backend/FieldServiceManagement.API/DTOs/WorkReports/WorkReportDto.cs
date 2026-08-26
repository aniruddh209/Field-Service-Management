namespace FieldServiceManagement.API.DTOs.WorkReports;

public class WorkReportDto
{
    public int Id { get; set; }

    public int ServiceRequestId { get; set; }

    public int TechnicianId { get; set; }

    public string TechnicianName { get; set; } = string.Empty;

    public string CustomerName { get; set; } = string.Empty;

    public string ServiceName { get; set; } = string.Empty;

    public string Diagnosis { get; set; } = string.Empty;

    public string WorkPerformed { get; set; } = string.Empty;

    public decimal LabourHours { get; set; }

    public decimal SuggestedLabourCharge { get; set; }

    public List<WorkReportPartDto> Parts { get; set; }
        = new();

    public string Resolution { get; set; } = string.Empty;

    public string CustomerSignature { get; set; } = string.Empty;

    public string TechnicianRemarks { get; set; } = string.Empty;

    public int WarrantyDays { get; set; }

    public string ManagerReviewStatus { get; set; } = string.Empty;

    public string? CorrectionReason { get; set; }

    public DateTime SubmittedAt { get; set; }
}