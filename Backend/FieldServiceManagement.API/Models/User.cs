using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FieldServiceManagement.API.Models;

public class User
{
    [Key]
    public int Id { get; set; }


    // =========================================================
    // USER INFORMATION
    // =========================================================

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [Phone]
    [StringLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(30)]
    public string Role { get; set; } = string.Empty;

    public string? ProfileImage { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }


    // =========================================================
    // COMPUTED PROPERTY
    // =========================================================

    [NotMapped]
    public string FullName =>
        $"{FirstName} {LastName}";


    // =========================================================
    // TECHNICIAN RELATIONSHIP
    // =========================================================

    // One User can have one Technician.
    public Technician? Technician { get; set; }


    // =========================================================
    // ASSET RELATIONSHIP
    // =========================================================

    // One Customer/User can have many Assets.
    public ICollection<Asset> Assets { get; set; }
        = new List<Asset>();


    // =========================================================
    // SERVICE REQUEST RELATIONSHIP
    // =========================================================

    // One Customer/User can have many ServiceRequests.
    public ICollection<ServiceRequest> ServiceRequests { get; set; }
        = new List<ServiceRequest>();
}