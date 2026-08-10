using System.ComponentModel.DataAnnotations;

namespace FieldServiceManagement.API.DTOs.ServiceRequests;

public class UpdateRequestStatusDto
{
    [Required]
    [StringLength(30)]
    public string Status { get; set; } = string.Empty;

    public string? Notes { get; set; }
}