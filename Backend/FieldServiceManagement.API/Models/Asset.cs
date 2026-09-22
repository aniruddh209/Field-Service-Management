using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FieldServiceManagement.API.Models;

public class Asset
{
    [Key]
    public int Id { get; set; }

    public int CustomerId { get; set; }

    [ForeignKey(nameof(CustomerId))]
    public User Customer { get; set; } = null!;

    public string Name { get; set; } = string.Empty;

    public string? Brand { get; set; }

    public string? Model { get; set; }

    public string? SerialNumber { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<ServiceRequest> ServiceRequests { get; set; }
        = new List<ServiceRequest>();
}