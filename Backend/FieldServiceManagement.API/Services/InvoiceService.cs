using System.Data;
using FieldServiceManagement.API.Data;
using FieldServiceManagement.API.DTOs.Invoices;
using FieldServiceManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FieldServiceManagement.API.Services;

public class InvoiceService
{
    private readonly AppDbContext _context;

    public InvoiceService(AppDbContext context)
    {
        _context = context;
    }


    public async Task<InvoiceDto?> GenerateAsync(
        int userId,
        CreateInvoiceDto dto)
    {
        await using var transaction =
            await _context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        try
        {


            var workReport =
                await _context.WorkReports

                    .Include(w => w.ServiceRequest)
                        .ThenInclude(sr => sr.Customer)

                    .Include(w => w.ServiceRequest)
                        .ThenInclude(sr => sr.Service)

                    .Include(w => w.Parts)
                        .ThenInclude(p => p.InventoryItem)

                    .FirstOrDefaultAsync(w =>
                        w.ServiceRequestId ==
                        dto.ServiceRequestId);


            if (workReport == null)
            {
                await transaction.RollbackAsync();
                return null;
            }


            if (!string.Equals(
                    workReport.ManagerReviewStatus,
                    "Approved",
                    StringComparison.OrdinalIgnoreCase))
            {
                await transaction.RollbackAsync();
                return null;
            }


            var serviceRequest =
                workReport.ServiceRequest;

            if (serviceRequest == null)
            {
                await transaction.RollbackAsync();
                return null;
            }


            var customer =
                serviceRequest.Customer;

            if (customer == null)
            {
                await transaction.RollbackAsync();
                return null;
            }


            var existingInvoice =
                await _context.Invoices

                    .Include(i => i.Customer)

                    .Include(i => i.GeneratedByUser)

                    .Include(i => i.ServiceRequest)
                        .ThenInclude(sr => sr.Service)

                    .Include(i => i.Items)

                    .FirstOrDefaultAsync(i =>
                        i.WorkReportId ==
                        workReport.Id);


            if (existingInvoice != null)
            {
                await transaction.RollbackAsync();

                return MapToDto(existingInvoice);
            }


            var labourAmount = dto.LabourCharge ?? workReport.SuggestedLabourCharge;

            var partsAmount = workReport.Parts.Sum(p => p.TotalPrice);

            var serviceCharge = dto.ServiceCharge ?? 500m;

            var subTotal = serviceCharge + labourAmount + partsAmount;

            var taxAmount = dto.TaxAmount > 0 ? dto.TaxAmount : Math.Round(subTotal * 0.18m, 2);

            var totalAmount = subTotal + taxAmount;

            var invoiceNumber = await GenerateInvoiceNumberAsync();

            var invoice = new Invoice
            {
                ServiceRequestId = serviceRequest.Id,
                WorkReportId = workReport.Id,
                CustomerId = customer.Id,
                InvoiceNumber = invoiceNumber,
                LabourCharge = labourAmount,
                PartsAmount = partsAmount,
                SubTotal = subTotal,
                TaxAmount = taxAmount,
                TotalAmount = totalAmount,
                Status = "Unpaid",
                PaidAt = null,
                GeneratedByUserId = userId,
                IssuedAt = DateTime.UtcNow,
                Notes = dto.Notes
            };

            _context.Invoices.Add(invoice);

            serviceRequest.Status = "Invoiced";
            serviceRequest.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();


            foreach (var reportPart in workReport.Parts)
            {
                var inventoryItem =
                    reportPart.InventoryItem;


                var invoiceItem =
                    new InvoiceItem
                    {
                        InvoiceId =
                            invoice.Id,

                        InventoryItemId =
                            reportPart.InventoryItemId,

                        ItemName =
                            inventoryItem?.Name
                            ?? "Unknown Item",

                        SKU =
                            inventoryItem?.SKU,

                        Quantity =
                            reportPart.Quantity,

                        UnitPrice =
                            reportPart.UnitPrice,

                        TotalPrice =
                            reportPart.TotalPrice
                    };


                _context.InvoiceItems.Add(invoiceItem);
            }


            await _context.SaveChangesAsync();


            var notification =
                new Notification
                {
                    UserId =
                        customer.Id,

                    Title =
                        "Invoice Generated",

                    Message =
                        $"Invoice {invoice.InvoiceNumber} has been generated for your service request.",

                    Type =
                        "Invoice",

                    RelatedEntityType =
                        "Invoice",

                    RelatedEntityId =
                        invoice.Id,

                    IsRead =
                        false,

                    CreatedAt =
                        DateTime.UtcNow
                };


            _context.Notifications.Add(notification);


            await _context.SaveChangesAsync();


            await transaction.CommitAsync();


            var createdInvoice =
                await GetByIdEntityAsync(invoice.Id);


            if (createdInvoice == null)
                return null;


            return MapToDto(createdInvoice);
        }
        catch
        {
            await transaction.RollbackAsync();

            return null;
        }
    }


    public async Task<InvoiceDto?> GetByIdAsync(
        int invoiceId)
    {
        var invoice =
            await GetByIdEntityAsync(invoiceId);

        if (invoice == null)
            return null;

        return MapToDto(invoice);
    }


    public async Task<List<InvoiceDto>> GetMyInvoicesAsync(
        int userId)
    {
        var invoices =
            await _context.Invoices

                .AsNoTracking()

                .Include(i => i.Customer)

                .Include(i => i.GeneratedByUser)

                .Include(i => i.ServiceRequest)
                    .ThenInclude(sr => sr.Service)

                .Include(i => i.Items)

                .Where(i =>
                    i.CustomerId == userId)

                .OrderByDescending(i =>
                    i.IssuedAt)

                .ToListAsync();


        return invoices
            .Select(MapToDto)
            .ToList();
    }


    public async Task<List<InvoiceDto>> GetAllAsync()
    {
        var invoices =
            await _context.Invoices

                .AsNoTracking()

                .Include(i => i.Customer)

                .Include(i => i.GeneratedByUser)

                .Include(i => i.ServiceRequest)
                    .ThenInclude(sr => sr.Service)

                .Include(i => i.Items)

                .OrderByDescending(i =>
                    i.IssuedAt)

                .ToListAsync();


        return invoices
            .Select(MapToDto)
            .ToList();
    }


    public async Task<List<InvoiceDto>> GetByCustomerAsync(
        int customerId)
    {
        var invoices =
            await _context.Invoices

                .AsNoTracking()

                .Include(i => i.Customer)

                .Include(i => i.GeneratedByUser)

                .Include(i => i.ServiceRequest)
                    .ThenInclude(sr => sr.Service)

                .Include(i => i.Items)

                .Where(i =>
                    i.CustomerId == customerId)

                .OrderByDescending(i =>
                    i.IssuedAt)

                .ToListAsync();


        return invoices
            .Select(MapToDto)
            .ToList();
    }


    public async Task<bool> UpdateStatusAsync(
        int invoiceId,
        string status)
    {
        if (string.IsNullOrWhiteSpace(status))
            return false;


        status =
            status.Trim();


        var allowedStatuses =
            new[]
            {
                "Unpaid",
                "Paid",
                "Cancelled"
            };


        var normalizedStatus =
            allowedStatuses.FirstOrDefault(s =>
                string.Equals(
                    s,
                    status,
                    StringComparison.OrdinalIgnoreCase));


        if (normalizedStatus == null)
            return false;


        var invoice =
            await _context.Invoices
                .FirstOrDefaultAsync(i =>
                    i.Id == invoiceId);


        if (invoice == null)
            return false;


        invoice.Status =
            normalizedStatus;


        if (normalizedStatus == "Paid")
        {
            if (invoice.PaidAt == null)
            {
                invoice.PaidAt =
                    DateTime.UtcNow;
            }
        }
        else
        {
            invoice.PaidAt =
                null;
        }


        await _context.SaveChangesAsync();

        return true;
    }


    public async Task<List<InvoiceDto>> GetByStatusAsync(
        string status)
    {
        if (string.IsNullOrWhiteSpace(status))
            return new List<InvoiceDto>();


        status =
            status.Trim();


        var invoices =
            await _context.Invoices

                .AsNoTracking()

                .Include(i => i.Customer)

                .Include(i => i.GeneratedByUser)

                .Include(i => i.ServiceRequest)
                    .ThenInclude(sr => sr.Service)

                .Include(i => i.Items)

                .Where(i =>
                    i.Status == status)

                .OrderByDescending(i =>
                    i.IssuedAt)

                .ToListAsync();


        return invoices
            .Select(MapToDto)
            .ToList();
    }


    public async Task<bool> ExistsForServiceRequestAsync(
        int serviceRequestId)
    {
        return await _context.Invoices
            .AnyAsync(i =>
                i.ServiceRequestId ==
                serviceRequestId);
    }


    public async Task<InvoiceDto?> GetByServiceRequestIdAsync(
        int serviceRequestId)
    {
        var invoice = await _context.Invoices
            .AsNoTracking()
            .Include(i => i.Customer)
            .Include(i => i.GeneratedByUser)
            .Include(i => i.ServiceRequest)
                .ThenInclude(sr => sr.Service)
            .Include(i => i.WorkReport)
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i =>
                i.ServiceRequestId == serviceRequestId);

        if (invoice == null)
            return null;

        return MapToDto(invoice);
    }


    public async Task<bool> ExistsForWorkReportAsync(
        int workReportId)
    {
        return await _context.Invoices
            .AnyAsync(i =>
                i.WorkReportId ==
                workReportId);
    }


    private async Task<Invoice?> GetByIdEntityAsync(
        int invoiceId)
    {
        return await _context.Invoices

            .AsNoTracking()

            .Include(i => i.Customer)

            .Include(i => i.GeneratedByUser)

            .Include(i => i.ServiceRequest)
                .ThenInclude(sr => sr.Service)

            .Include(i => i.WorkReport)

            .Include(i => i.Items)

            .FirstOrDefaultAsync(i =>
                i.Id == invoiceId);
    }


    private async Task<string> GenerateInvoiceNumberAsync()
    {
        var year =
            DateTime.UtcNow.Year;


        var prefix =
            $"INV-{year}-";


        var lastInvoiceNumber =
            await _context.Invoices

                .Where(i =>
                    i.InvoiceNumber.StartsWith(prefix))

                .OrderByDescending(i =>
                    i.Id)

                .Select(i =>
                    i.InvoiceNumber)

                .FirstOrDefaultAsync();


        var nextNumber =
            1;


        if (!string.IsNullOrWhiteSpace(
                lastInvoiceNumber))
        {
            var numberPart =
                lastInvoiceNumber.Substring(
                    prefix.Length);


            if (int.TryParse(
                    numberPart,
                    out var lastNumber))
            {
                nextNumber =
                    lastNumber + 1;
            }
        }


        return
            $"{prefix}{nextNumber:D6}";
    }


    private static InvoiceDto MapToDto(Invoice invoice)
    {
        if (invoice == null) return new InvoiceDto();

        return new InvoiceDto
        {
            Id = invoice.Id,
            ServiceRequestId = invoice.ServiceRequestId,
            RequestNumber = $"SR-{invoice.ServiceRequestId:D4}",
            WorkReportId = invoice.WorkReportId,
            CustomerId = invoice.CustomerId,
            InvoiceNumber = invoice.InvoiceNumber ?? string.Empty,
            CustomerName = invoice.Customer?.FullName ?? string.Empty,
            ServiceName = invoice.ServiceRequest?.Service?.ServiceName ?? string.Empty,
            ServiceAmount = invoice.SubTotal > (invoice.LabourCharge + invoice.PartsAmount) 
                ? (invoice.SubTotal - invoice.LabourCharge - invoice.PartsAmount) 
                : 500m,
            LabourCharge = invoice.LabourCharge,
            PartsAmount = invoice.PartsAmount,
            SubTotal = invoice.SubTotal,
            TaxAmount = invoice.TaxAmount,
            TotalAmount = invoice.TotalAmount,
            Status = invoice.Status ?? "Unpaid",
            PaidAt = invoice.PaidAt,
            GeneratedByUserId = invoice.GeneratedByUserId,
            GeneratedByName = invoice.GeneratedByUser?.FullName ?? string.Empty,
            IssuedAt = invoice.IssuedAt,
            DueDate = invoice.IssuedAt.AddDays(7),
            Notes = invoice.Notes,

            Items = (invoice.Items ?? new List<InvoiceItem>())
                .Select(item => new InvoiceItemDto
                {
                    Id = item.Id,
                    InventoryItemId = item.InventoryItemId,
                    ItemName = item.ItemName ?? string.Empty,
                    SKU = item.SKU,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TotalPrice = item.TotalPrice
                })
                .ToList()
        };
    }
}