using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace FieldServiceManagement.API.Models;

public class CustomerAddress
{
    [Key]
    public int Id { get; set; }

    public int CustomerId { get; set; }

    [ForeignKey(nameof(CustomerId))]
    [JsonIgnore]
    public User? Customer { get; set; }

    public string AddressTitle { get; set; } = string.Empty;

    public string AddressLine { get; set; } = string.Empty;

    public string Area { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string State { get; set; } = string.Empty;

    public string Pincode { get; set; } = string.Empty;

    public string? Landmark { get; set; }
}