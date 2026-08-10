using System.ComponentModel.DataAnnotations;

namespace FieldServiceManagement.API.Models;

public class WorkReport
{
    [Key]
    public int Id { get; set; }

    public int ServiceRequestId { get; set; }

    public int TechnicianId { get; set; }

    public string Diagnosis { get; set; } = string.Empty;

    public string WorkPerformed { get; set; } = string.Empty;

    public decimal LabourHours { get; set; }

    public decimal SuggestedLabourCharge { get; set; }

    public string PartsUsed { get; set; } = string.Empty;

    public string Resolution { get; set; } = string.Empty;

    public string CustomerSignature { get; set; } = string.Empty;

    public string TechnicianRemarks { get; set; } = string.Empty;

    public int WarrantyDays { get; set; }

    public string ManagerReviewStatus { get; set; } = "Pending";

    public string? CorrectionReason { get; set; }

    public DateTime SubmittedAt { get; set; } = DateTime.Now;
}