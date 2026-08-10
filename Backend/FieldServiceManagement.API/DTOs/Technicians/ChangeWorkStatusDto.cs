using System.ComponentModel.DataAnnotations;

namespace FieldServiceManagement.API.DTOs.Technicians;

public class ChangeWorkStatusDto
{
    [Required(ErrorMessage = "Status is required.")]
    [StringLength(30)]
    public string Status { get; set; } = string.Empty;
}