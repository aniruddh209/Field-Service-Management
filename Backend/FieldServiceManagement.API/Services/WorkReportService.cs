using System.Data;
using FieldServiceManagement.API.Data;
using FieldServiceManagement.API.DTOs.WorkReports;
using FieldServiceManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FieldServiceManagement.API.Services;

public class WorkReportService
{
    private readonly AppDbContext _context;

    public WorkReportService(AppDbContext context)
    {
        _context = context;
    }
    
    // TECHNICIAN - CREATE WORK REPORT
    public async Task<bool> CreateAsync(
        int userId,
        CreateWorkReportDto dto)
    {
        await using var transaction =
            await _context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        try
        {
            // Find technician
            var technician = await _context.Technicians
                .FirstOrDefaultAsync(t =>
                    t.UserId == userId &&
                    t.IsActive);

            if (technician == null)
                return false;


            // Find service request
            var request = await _context.ServiceRequests
                .FirstOrDefaultAsync(sr =>
                    sr.Id == dto.ServiceRequestId);

            if (request == null)
                return false;


            // Make sure request belongs to technician
            if (request.TechnicianId != technician.Id)
                return false;


            // Work report can only be submitted for completed work
            if (request.Status != "Completed")
                return false;


            // Only one work report per service request
            var reportExists = await _context.WorkReports
                .AnyAsync(w =>
                    w.ServiceRequestId == dto.ServiceRequestId);

            if (reportExists)
                return false;


            // Validate duplicate inventory items
            if (dto.Parts
                .GroupBy(p => p.InventoryItemId)
                .Any(g => g.Count() > 1))
            {
                return false;
            }


            // Get inventory items
            var inventoryIds = dto.Parts
                .Select(p => p.InventoryItemId)
                .Distinct()
                .ToList();

            var inventoryItems = await _context.InventoryItems
                .Where(i =>
                    inventoryIds.Contains(i.Id) &&
                    i.IsActive)
                .ToListAsync();


            // Every requested item must exist and be active
            if (inventoryItems.Count != inventoryIds.Count)
                return false;


            // Validate stock
            foreach (var part in dto.Parts)
            {
                var inventoryItem = inventoryItems
                    .First(i => i.Id == part.InventoryItemId);

                if (part.Quantity <= 0)
                    return false;

                if (inventoryItem.QuantityInStock < part.Quantity)
                    return false;
            }


            // Create work report
            var report = new WorkReport
            {
                ServiceRequestId = dto.ServiceRequestId,

                TechnicianId = technician.Id,

                Diagnosis = dto.Diagnosis.Trim(),

                WorkPerformed = dto.WorkPerformed.Trim(),

                LabourHours = dto.LabourHours,

                SuggestedLabourCharge =
                    dto.SuggestedLabourCharge,

                Resolution = dto.Resolution.Trim(),

                CustomerSignature =
                    dto.CustomerSignature?.Trim() ?? string.Empty,

                TechnicianRemarks =
                    dto.TechnicianRemarks?.Trim() ?? string.Empty,

                WarrantyDays = dto.WarrantyDays,

                ManagerReviewStatus = "Pending",

                CorrectionReason = null,

                SubmittedAt = DateTime.UtcNow
            };


            _context.WorkReports.Add(report);

            await _context.SaveChangesAsync();


            // Create WorkReportPart records
            foreach (var part in dto.Parts)
            {
                var inventoryItem = inventoryItems
                    .First(i => i.Id == part.InventoryItemId);

                var totalPrice =
                    inventoryItem.UnitPrice * part.Quantity;

                var reportPart = new WorkReportPart
                {
                    WorkReportId = report.Id,

                    InventoryItemId =
                        inventoryItem.Id,

                    Quantity = part.Quantity,

                    // Snapshot current price
                    UnitPrice =
                        inventoryItem.UnitPrice,

                    // Server calculates total
                    TotalPrice =
                        totalPrice
                };

                _context.WorkReportParts.Add(reportPart);


                // Deduct inventory
                inventoryItem.QuantityInStock -=
                    part.Quantity;

                inventoryItem.UpdatedAt =
                    DateTime.UtcNow;
            }


            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return true;
        }
        catch
        {
            await transaction.RollbackAsync();
            return false;
        }
    }
    
    // TECHNICIAN - GET OWN REPORTS


    public async Task<List<WorkReportDto>> GetMyReportsAsync(
        int userId)
    {
        var reports = await _context.WorkReports
            .Include(w => w.Technician)
                .ThenInclude(t => t.User)

            .Include(w => w.ServiceRequest)
                .ThenInclude(sr => sr.Customer)

            .Include(w => w.ServiceRequest)
                .ThenInclude(sr => sr.Service)

            .Include(w => w.Parts)
                .ThenInclude(p => p.InventoryItem)

            .Where(w =>
                w.Technician.UserId == userId)

            .OrderByDescending(w => w.SubmittedAt)

            .ToListAsync();


        return reports
            .Select(MapToDto)
            .ToList();
    }

    
    // TECHNICIAN - UPDATE CORRECTION

    public async Task<bool> UpdateAsync(
        int reportId,
        int userId,
        UpdateWorkReportDto dto)
    {
        await using var transaction =
            await _context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        try
        {
            // Find technician
            var technician = await _context.Technicians
                .FirstOrDefaultAsync(t =>
                    t.UserId == userId &&
                    t.IsActive);

            if (technician == null)
                return false;


            // Find report + existing parts
            var report = await _context.WorkReports
                .Include(w => w.Parts)
                .FirstOrDefaultAsync(w =>
                    w.Id == reportId &&
                    w.TechnicianId == technician.Id);

            if (report == null)
                return false;


            // Only correction-required reports can be edited
            if (report.ManagerReviewStatus !=
                "CorrectionRequired")
            {
                return false;
            }


            // Prevent duplicate inventory items
            if (dto.Parts
                .GroupBy(p => p.InventoryItemId)
                .Any(g => g.Count() > 1))
            {
                return false;
            }


            // Load new inventory items
            var inventoryIds = dto.Parts
                .Select(p => p.InventoryItemId)
                .Distinct()
                .ToList();


            var inventoryItems = await _context.InventoryItems
                .Where(i =>
                    inventoryIds.Contains(i.Id) &&
                    i.IsActive)
                .ToListAsync();


            if (inventoryItems.Count != inventoryIds.Count)
                return false;

            
            // Restore stock used by old report

            foreach (var oldPart in report.Parts)
            {
                var oldInventoryItem =
                    await _context.InventoryItems
                        .FirstOrDefaultAsync(i =>
                            i.Id == oldPart.InventoryItemId);

                if (oldInventoryItem == null)
                    return false;

                oldInventoryItem.QuantityInStock +=
                    oldPart.Quantity;

                oldInventoryItem.UpdatedAt =
                    DateTime.UtcNow;
            }

            
            // Validate stock for new parts AFTER restoration

            foreach (var part in dto.Parts)
            {
                var inventoryItem = inventoryItems
                    .First(i => i.Id == part.InventoryItemId);

                if (part.Quantity <= 0)
                    return false;

                if (inventoryItem.QuantityInStock <
                    part.Quantity)
                {
                    return false;
                }
            }

            
            // Update report

            report.Diagnosis =
                dto.Diagnosis.Trim();

            report.WorkPerformed =
                dto.WorkPerformed.Trim();

            report.LabourHours =
                dto.LabourHours;

            report.SuggestedLabourCharge =
                dto.SuggestedLabourCharge;

            report.Resolution =
                dto.Resolution.Trim();

            report.CustomerSignature =
                dto.CustomerSignature?.Trim()
                ?? string.Empty;

            report.TechnicianRemarks =
                dto.TechnicianRemarks?.Trim()
                ?? string.Empty;

            report.WarrantyDays =
                dto.WarrantyDays;

            
            // Remove old parts


            _context.WorkReportParts.RemoveRange(
                report.Parts);
            
            // Add new parts

            foreach (var part in dto.Parts)
            {
                var inventoryItem = inventoryItems
                    .First(i =>
                        i.Id == part.InventoryItemId);

                var totalPrice =
                    inventoryItem.UnitPrice *
                    part.Quantity;

                var newReportPart =
                    new WorkReportPart
                    {
                        WorkReportId =
                            report.Id,

                        InventoryItemId =
                            inventoryItem.Id,

                        Quantity =
                            part.Quantity,

                        UnitPrice =
                            inventoryItem.UnitPrice,

                        TotalPrice =
                            totalPrice
                    };

                _context.WorkReportParts.Add(
                    newReportPart);


                // Deduct new stock
                inventoryItem.QuantityInStock -=
                    part.Quantity;

                inventoryItem.UpdatedAt =
                    DateTime.UtcNow;
            }


            // Back to manager review
            report.ManagerReviewStatus =
                "Pending";

            report.CorrectionReason =
                null;


            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return true;
        }
        catch
        {
            await transaction.RollbackAsync();
            return false;
        }
    }
    
    // MANAGER - GET ALL REPORTS

    public async Task<List<WorkReportDto>> GetAllAsync()
    {
        var reports = await _context.WorkReports

            .Include(w => w.Technician)
                .ThenInclude(t => t.User)

            .Include(w => w.ServiceRequest)
                .ThenInclude(sr => sr.Customer)

            .Include(w => w.ServiceRequest)
                .ThenInclude(sr => sr.Service)

            .Include(w => w.Parts)
                .ThenInclude(p => p.InventoryItem)

            .OrderByDescending(w => w.SubmittedAt)

            .ToListAsync();


        return reports
            .Select(MapToDto)
            .ToList();
    }

    
    // GET REPORT BY ID

    public async Task<WorkReportDto?> GetByIdAsync(
        int id)
    {
        var report = await _context.WorkReports

            .Include(w => w.Technician)
                .ThenInclude(t => t.User)

            .Include(w => w.ServiceRequest)
                .ThenInclude(sr => sr.Customer)

            .Include(w => w.ServiceRequest)
                .ThenInclude(sr => sr.Service)

            .Include(w => w.Parts)
                .ThenInclude(p => p.InventoryItem)

            .FirstOrDefaultAsync(w =>
                w.Id == id);


        if (report == null)
            return null;


        return MapToDto(report);
    }

    
    // MANAGER - APPROVE

    public async Task<bool> ApproveAsync(
        int reportId)
    {
        var report = await _context.WorkReports
            .FirstOrDefaultAsync(w =>
                w.Id == reportId);


        if (report == null)
            return false;


        if (report.ManagerReviewStatus !=
            "Pending")
        {
            return false;
        }


        report.ManagerReviewStatus =
            "Approved";

        report.CorrectionReason =
            null;


        await _context.SaveChangesAsync();

        return true;
    }

    
    // MANAGER - REQUEST CORRECTION

    public async Task<bool> RequestCorrectionAsync(
        int reportId,
        string correctionReason)
    {
        var report = await _context.WorkReports
            .FirstOrDefaultAsync(w =>
                w.Id == reportId);


        if (report == null)
            return false;


        if (report.ManagerReviewStatus !=
            "Pending")
        {
            return false;
        }


        if (string.IsNullOrWhiteSpace(
            correctionReason))
        {
            return false;
        }


        report.ManagerReviewStatus =
            "CorrectionRequired";

        report.CorrectionReason =
            correctionReason.Trim();


        await _context.SaveChangesAsync();

        return true;
    }

    
    // GET REPORTS BY STATUS

    public async Task<List<WorkReportDto>> GetByStatusAsync(
        string status)
    {
        if (string.IsNullOrWhiteSpace(status))
            return new List<WorkReportDto>();


        var reports = await _context.WorkReports

            .Include(w => w.Technician)
                .ThenInclude(t => t.User)

            .Include(w => w.ServiceRequest)
                .ThenInclude(sr => sr.Customer)

            .Include(w => w.ServiceRequest)
                .ThenInclude(sr => sr.Service)

            .Include(w => w.Parts)
                .ThenInclude(p => p.InventoryItem)

            .Where(w =>
                w.ManagerReviewStatus == status)

            .OrderByDescending(w =>
                w.SubmittedAt)

            .ToListAsync();


        return reports
            .Select(MapToDto)
            .ToList();
    }
    
    // MANAGER DASHBOARD

    public async Task<object> GetDashboardAsync()
    {
        var reports = await _context.WorkReports
            .AsNoTracking()
            .ToListAsync();


        return new
        {
            TotalReports =
                reports.Count,

            PendingReports =
                reports.Count(w =>
                    w.ManagerReviewStatus ==
                    "Pending"),

            ApprovedReports =
                reports.Count(w =>
                    w.ManagerReviewStatus ==
                    "Approved"),

            CorrectionRequiredReports =
                reports.Count(w =>
                    w.ManagerReviewStatus ==
                    "CorrectionRequired"),

            TotalLabourHours =
                reports.Sum(w =>
                    w.LabourHours),

            TotalSuggestedLabourCharges =
                reports.Sum(w =>
                    w.SuggestedLabourCharge),

            TotalPartsValue =
                reports
                    .SelectMany(w =>
                        w.Parts)
                    .Sum(p =>
                        p.TotalPrice)
        };
    }

    
    // MAPPING

    private static WorkReportDto MapToDto(
        WorkReport w)
    {
        return new WorkReportDto
        {
            Id = w.Id,

            ServiceRequestId =
                w.ServiceRequestId,

            TechnicianId =
                w.TechnicianId,

            TechnicianName =
                w.Technician.User.FullName,

            CustomerName =
                w.ServiceRequest.Customer.FullName,

            ServiceName =
                w.ServiceRequest.Service.ServiceName,

            Diagnosis =
                w.Diagnosis,

            WorkPerformed =
                w.WorkPerformed,

            LabourHours =
                w.LabourHours,

            SuggestedLabourCharge =
                w.SuggestedLabourCharge,

            Parts = w.Parts
                .Select(p => new WorkReportPartDto
                {
                    InventoryItemId =
                        p.InventoryItemId,

                    SKU =
                        p.InventoryItem.SKU,

                    PartName =
                        p.InventoryItem.Name,

                    Quantity =
                        p.Quantity,

                    UnitPrice =
                        p.UnitPrice,

                    TotalPrice =
                        p.TotalPrice
                })
                .ToList(),

            Resolution =
                w.Resolution,

            CustomerSignature =
                w.CustomerSignature,

            TechnicianRemarks =
                w.TechnicianRemarks,

            WarrantyDays =
                w.WarrantyDays,

            ManagerReviewStatus =
                w.ManagerReviewStatus,

            CorrectionReason =
                w.CorrectionReason,

            SubmittedAt =
                w.SubmittedAt
        };
    }
    
    public async Task<bool> AddPartAsync(
        int workReportId,
        int userId,
        AddWorkReportPartDto dto)
    {
        var workReport = await _context.WorkReports
            .Include(w => w.Technician)
            .FirstOrDefaultAsync(w =>
                w.Id == workReportId &&
                w.Technician.UserId == userId);

        if (workReport == null)
            return false;

        var item = await _context.InventoryItems
            .FirstOrDefaultAsync(i => i.Id == dto.InventoryItemId);

        if (item == null)
            return false;

        if (!item.IsActive)
            return false;

        if (item.QuantityInStock < dto.Quantity)
            return false;

        var totalPrice =
            item.UnitPrice * dto.Quantity;

        var part = new WorkReportPart
        {
            WorkReportId = workReport.Id,
            InventoryItemId = item.Id,
            Quantity = dto.Quantity,
            UnitPrice = item.UnitPrice,
            TotalPrice = totalPrice
        };

        item.QuantityInStock -= dto.Quantity;
        item.UpdatedAt = DateTime.UtcNow;

        var movement = new StockMovement
        {
            InventoryItemId = item.Id,
            QuantityChange = -dto.Quantity,
            QuantityAfterChange = item.QuantityInStock,
            Reason = $"Used in Work Report #{workReport.Id}",
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.WorkReportParts.Add(part);
        _context.StockMovements.Add(movement);

        await _context.SaveChangesAsync();

        return true;
    }
    
    public async Task<bool> RemovePartAsync(
        int workReportId,
        int partId,
        int userId)
    {
        var workReport = await _context.WorkReports
            .Include(w => w.Technician)
            .FirstOrDefaultAsync(w =>
                w.Id == workReportId &&
                w.Technician.UserId == userId);

        if (workReport == null)
            return false;

        var part = await _context.WorkReportParts
            .Include(p => p.InventoryItem)
            .FirstOrDefaultAsync(p =>
                p.Id == partId &&
                p.WorkReportId == workReportId);

        if (part == null)
            return false;

        var item = part.InventoryItem;

        // Return the used quantity back to inventory
        item.QuantityInStock += part.Quantity;
        item.UpdatedAt = DateTime.UtcNow;

        var movement = new StockMovement
        {
            InventoryItemId = item.Id,
            QuantityChange = part.Quantity,
            QuantityAfterChange = item.QuantityInStock,
            Reason = $"Part removed from Work Report #{workReportId}",
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.WorkReportParts.Remove(part);
        _context.StockMovements.Add(movement);

        await _context.SaveChangesAsync();

        return true;
    }
}