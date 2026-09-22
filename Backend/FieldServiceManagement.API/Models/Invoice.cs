using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FieldServiceManagement.API.Models;

public class Invoice
{
    [Key]
    public int Id { get; set; }

    public int ServiceRequestId { get; set; }

    [ForeignKey(nameof(ServiceRequestId))]
    public ServiceRequest? ServiceRequest { get; set; }

    public int WorkReportId { get; set; }

    [ForeignKey(nameof(WorkReportId))]
    public WorkReport? WorkReport { get; set; }

    public int CustomerId { get; set; }

    [ForeignKey(nameof(CustomerId))]
    public User? Customer { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal LabourCharge { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal PartsAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal SubTotal { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TaxAmount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    public string Status { get; set; } = "Unpaid";

    public DateTime? PaidAt { get; set; }

    public int GeneratedByUserId { get; set; }

    [ForeignKey(nameof(GeneratedByUserId))]
    public User? GeneratedByUser { get; set; }

    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;

    public string? Notes { get; set; }

    public ICollection<InvoiceItem> Items { get; set; }
        = new List<InvoiceItem>();
}