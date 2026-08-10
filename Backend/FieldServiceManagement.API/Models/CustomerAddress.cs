using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FieldServiceManagement.API.Models;

public class CustomerAddress
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int CustomerId { get; set; }

    [ForeignKey(nameof(CustomerId))]
    public User Customer { get; set; } = null!;

    public string AddressTitle { get; set; } = string.Empty;

    [Required]
    public string AddressLine { get; set; } = string.Empty;

    public string Area { get; set; } = string.Empty;

    [Required]
    public string City { get; set; } = string.Empty;

    [Required]
    public string State { get; set; } = string.Empty;

    [Required]
    public string Pincode { get; set; } = string.Empty;

    public string? Landmark { get; set; }
}