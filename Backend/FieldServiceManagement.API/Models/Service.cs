using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
namespace FieldServiceManagement.API.Models;

public class Service
{
    [Key] public int Id { get; set; }

    [Required(ErrorMessage = "Service Name is Required")]
    [StringLength(100)]
    public string ServiceName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Category is Required")]
    [StringLength(50)]
    public string Category { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is Required")]
    public string Description { get; set; } = string.Empty;

    [Required] [Range(1, 100000)] public decimal BasePrice { get; set; }

    [Range(1, 24)] public int EstimatedHours { get; set; }

    public string? Image { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [JsonIgnore]
    public ICollection<ServiceRequest> ServiceRequests { get; set; }
        = new List<ServiceRequest>();
}