using System.ComponentModel.DataAnnotations;

namespace FieldServiceManagement.API.DTOs.WorkReports;

public class RequestCorrectionDto
{
    [Required]
    [StringLength(1000)]
    public string CorrectionReason { get; set; } = string.Empty;
}