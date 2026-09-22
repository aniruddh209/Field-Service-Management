namespace FieldServiceManagement.API.DTOs.Invoices;

public class CreateInvoiceDto
{
    public int ServiceRequestId { get; set; }

    public decimal? ServiceCharge { get; set; }

    public decimal? LabourCharge { get; set; }

    public decimal TaxAmount { get; set; }

    public string? Notes { get; set; }
}