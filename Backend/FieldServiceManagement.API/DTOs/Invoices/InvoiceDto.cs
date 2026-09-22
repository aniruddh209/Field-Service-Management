namespace FieldServiceManagement.API.DTOs.Invoices;

public class InvoiceDto
{
    public int Id { get; set; }

    public int ServiceRequestId { get; set; }

    public string RequestNumber { get; set; } = string.Empty;

    public int WorkReportId { get; set; }

    public int CustomerId { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;

    public string CustomerName { get; set; } = string.Empty;

    public string ServiceName { get; set; } = string.Empty;


    public decimal ServiceAmount { get; set; }

    public decimal LabourCharge { get; set; }

    public decimal PartsAmount { get; set; }

    public decimal SubTotal { get; set; }

    public decimal TaxAmount { get; set; }

    public decimal TotalAmount { get; set; }


    public string Status { get; set; } = string.Empty;


    public DateTime? PaidAt { get; set; }


    public int GeneratedByUserId { get; set; }

    public string GeneratedByName { get; set; } = string.Empty;


    public DateTime IssuedAt { get; set; }

    public DateTime DueDate { get; set; }


    public string? Notes { get; set; }


    public List<InvoiceItemDto> Items { get; set; } = new();
}