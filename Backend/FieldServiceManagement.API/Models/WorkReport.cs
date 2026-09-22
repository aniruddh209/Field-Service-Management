using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FieldServiceManagement.API.Models;

[Index(nameof(ServiceRequestId), IsUnique = true)]
public class WorkReport
{
    [Key]
    public int Id { get; set; }

    public int ServiceRequestId { get; set; }

    [ForeignKey(nameof(ServiceRequestId))]
    public ServiceRequest ServiceRequest { get; set; } = null!;

    public int TechnicianId { get; set; }

    [ForeignKey(nameof(TechnicianId))]
    public Technician Technician { get; set; } = null!;

    public string Diagnosis { get; set; } = string.Empty;

    public string WorkPerformed { get; set; } = string.Empty;

    [Column(TypeName = "decimal(5,2)")]
    public decimal LabourHours { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal SuggestedLabourCharge { get; set; }

    public ICollection<WorkReportPart> Parts { get; set; }
        = new List<WorkReportPart>();

    public string Resolution { get; set; } = string.Empty;

    public string CustomerSignature { get; set; } = string.Empty;

    public string TechnicianRemarks { get; set; } = string.Empty;

    public int WarrantyDays { get; set; }

    public string ManagerReviewStatus { get; set; } = "Pending";

    public string? CorrectionReason { get; set; }

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
}