using System.ComponentModel.DataAnnotations;

namespace FieldServiceManagement.API.DTOs.ServiceRequests;

public class CreateServiceRequestDto
{
    [Required]
    public int ServiceId { get; set; }

    [Required]
    [StringLength(500, MinimumLength = 10)]
    public string ProblemDescription { get; set; } = string.Empty;

    [Required]
    [StringLength(300)]
    public string ServiceAddress { get; set; } = string.Empty;

    [Required]
    public DateTime PreferredDate { get; set; }
    public string? Notes { get; set; }
}