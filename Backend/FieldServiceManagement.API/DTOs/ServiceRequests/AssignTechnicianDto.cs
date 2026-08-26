using System.ComponentModel.DataAnnotations;

namespace FieldServiceManagement.API.DTOs.ServiceRequests;

public class AssignTechnicianDto
{
    [Required]
    public int TechnicianId { get; set; }
}