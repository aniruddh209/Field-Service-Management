using System.ComponentModel.DataAnnotations;

namespace FieldServiceManagement.API.Models;

public class Invoice
{
    [Key]
    public int Id { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;

    public int ServiceRequestId { get; set; }

    public int CustomerId { get; set; }

    public int ManagerId { get; set; }

    public decimal ServiceCharge { get; set; }

    public decimal LabourCharge { get; set; }

    public decimal PartsCharge { get; set; }

    public decimal GST { get; set; }

    public decimal Discount { get; set; }

    public decimal TotalAmount { get; set; }

    public string PaymentStatus { get; set; } = "Draft";

    public string PaymentMethod { get; set; } = string.Empty;

    public DateTime IssueDate { get; set; } = DateTime.Now;

    public DateTime DueDate { get; set; }

    public DateTime? PaidDate { get; set; }

    public int WarrantyDays { get; set; }

    public string? Notes { get; set; }
}