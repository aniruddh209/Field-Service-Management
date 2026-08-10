using FieldServiceManagement.API.Data;
using FieldServiceManagement.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace FieldServiceManagement.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class InvoicesController : ControllerBase
{
    private readonly AppDbContext _context;

    public InvoicesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetAllInvoices()
    {
        return Ok(_context.Invoices.ToList());
    }

    [HttpGet("{id}")]
    public IActionResult GetInvoiceById(int id)
    {
        var invoice = _context.Invoices.Find(id);

        if (invoice == null)
            return NotFound("Invoice Not Found");

        return Ok(invoice);
    }

    [HttpPost]
    public IActionResult InsertInvoice(Invoice invoice)
    {
        _context.Invoices.Add(invoice);
        _context.SaveChanges();

        return Ok("Invoice Added Successfully");
    }

    [HttpPut("{id}")]
    public IActionResult UpdateInvoice(int id, Invoice invoice)
    {
        if (id != invoice.Id)
            return BadRequest("Invoice Id Mismatch");

        var existingInvoice = _context.Invoices.Find(id);

        if (existingInvoice == null)
            return NotFound("Invoice Not Found");

        existingInvoice.InvoiceNumber = invoice.InvoiceNumber;
        existingInvoice.ServiceRequestId = invoice.ServiceRequestId;
        existingInvoice.CustomerId = invoice.CustomerId;
        existingInvoice.ManagerId = invoice.ManagerId;
        existingInvoice.ServiceCharge = invoice.ServiceCharge;
        existingInvoice.LabourCharge = invoice.LabourCharge;
        existingInvoice.PartsCharge = invoice.PartsCharge;
        existingInvoice.GST = invoice.GST;
        existingInvoice.Discount = invoice.Discount;
        existingInvoice.TotalAmount = invoice.TotalAmount;
        existingInvoice.PaymentStatus = invoice.PaymentStatus;
        existingInvoice.PaymentMethod = invoice.PaymentMethod;
        existingInvoice.IssueDate = invoice.IssueDate;
        existingInvoice.DueDate = invoice.DueDate;
        existingInvoice.PaidDate = invoice.PaidDate;
        existingInvoice.WarrantyDays = invoice.WarrantyDays;
        existingInvoice.Notes = invoice.Notes;

        _context.SaveChanges();

        return Ok("Invoice Updated Successfully");
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteInvoice(int id)
    {
        var invoice = _context.Invoices.Find(id);

        if (invoice == null)
            return NotFound("Invoice Not Found");

        _context.Invoices.Remove(invoice);
        _context.SaveChanges();

        return Ok("Invoice Deleted Successfully");
    }
}