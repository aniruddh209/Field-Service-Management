using System.ComponentModel.DataAnnotations;

namespace FieldServiceManagement.API.DTOs.WorkReports;

public class CreateWorkReportDto
{
    [Required]
    public int ServiceRequestId { get; set; }

    [Required]
    [StringLength(2000)]
    public string Diagnosis { get; set; } = string.Empty;

    [Required]
    [StringLength(2000)]
    public string WorkPerformed { get; set; } = string.Empty;

    [Range(0, 24)]
    public decimal LabourHours { get; set; }

    [Range(0, 999999999)]
    public decimal SuggestedLabourCharge { get; set; }

    public List<WorkReportPartInputDto> Parts { get; set; } = new();

    [Required]
    [StringLength(2000)]
    public string Resolution { get; set; } = string.Empty;

    [StringLength(1000)]
    public string CustomerSignature { get; set; } = string.Empty;

    [StringLength(2000)]
    public string TechnicianRemarks { get; set; } = string.Empty;

    [Range(0, 3650)]
    public int WarrantyDays { get; set; }
}