namespace FieldServiceManagement.API.DTOs.WorkReports;

public class UpdateWorkReportDto
{
    public string Diagnosis { get; set; } = string.Empty;

    public string WorkPerformed { get; set; } = string.Empty;

    public decimal LabourHours { get; set; }

    public decimal SuggestedLabourCharge { get; set; }

    public List<WorkReportPartInputDto> Parts { get; set; } = new();

    public string Resolution { get; set; } = string.Empty;

    public string CustomerSignature { get; set; } = string.Empty;

    public string TechnicianRemarks { get; set; } = string.Empty;

    public int WarrantyDays { get; set; }
}