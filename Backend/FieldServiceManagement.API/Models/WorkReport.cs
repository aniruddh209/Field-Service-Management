using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FieldServiceManagement.API.Models;

[Index(nameof(ServiceRequestId), IsUnique = true)]
public class WorkReport
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int ServiceRequestId { get; set; }

    [ForeignKey(nameof(ServiceRequestId))]
    public ServiceRequest ServiceRequest { get; set; } = null!;


    [Required]
    public int TechnicianId { get; set; }

    [ForeignKey(nameof(TechnicianId))]
    public Technician Technician { get; set; } = null!;
    

    [Required]
    [StringLength(2000)]
    public string Diagnosis { get; set; } = string.Empty;


    [Required]
    [StringLength(2000)]
    public string WorkPerformed { get; set; } = string.Empty;


    [Range(0, 24)]
    [Column(TypeName = "decimal(5,2)")]
    public decimal LabourHours { get; set; }


    [Range(0, 999999999)]
    [Column(TypeName = "decimal(18,2)")]
    public decimal SuggestedLabourCharge { get; set; }

    
    public ICollection<WorkReportPart> Parts { get; set; }
        = new List<WorkReportPart>();
    
    [Required]
    [StringLength(2000)]
    public string Resolution { get; set; } = string.Empty;


    [StringLength(1000)]
    public string CustomerSignature { get; set; } = string.Empty;


    [StringLength(2000)]
    public string TechnicianRemarks { get; set; } = string.Empty;


    [Range(0, 3650)]
    public int WarrantyDays { get; set; }
    

    [Required]
    [StringLength(30)]
    public string ManagerReviewStatus { get; set; } = "Pending";


    [StringLength(1000)]
    public string? CorrectionReason { get; set; }
    

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
}