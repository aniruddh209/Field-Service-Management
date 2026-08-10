using System.ComponentModel.DataAnnotations;

namespace FieldServiceManagement.API.Models;

public class StatusHistory
{
    [Key]
    public int Id { get; set; }

    public int ServiceRequestId { get; set; }

    public string Status { get; set; } = string.Empty;

    public int ChangedByUserId { get; set; }

    public string Remarks { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.Now;
}