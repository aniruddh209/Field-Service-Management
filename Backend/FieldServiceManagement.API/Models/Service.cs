using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace FieldServiceManagement.API.Models;

public class Service
{
    [Key] public int Id { get; set; }

    public string ServiceName { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal BasePrice { get; set; }

    public int EstimatedHours { get; set; }

    public string? Image { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [JsonIgnore]
    public ICollection<ServiceRequest> ServiceRequests { get; set; }
        = new List<ServiceRequest>();
}