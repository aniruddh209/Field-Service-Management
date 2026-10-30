using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FieldServiceManagement.API.Models;

public class User
{
    [Key]
    public int Id { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public string? ProfileImage { get; set; }

    public string? RefreshToken { get; set; }

    public DateTime? RefreshTokenExpiryTime { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    [NotMapped]
    public string FullName =>
        $"{FirstName} {LastName}";

    public Technician? Technician { get; set; }

    public ICollection<Asset> Assets { get; set; }
        = new List<Asset>();

    public ICollection<ServiceRequest> ServiceRequests { get; set; }
        = new List<ServiceRequest>();

    public ICollection<Notification> Notifications { get; set; }
        = new List<Notification>();
}