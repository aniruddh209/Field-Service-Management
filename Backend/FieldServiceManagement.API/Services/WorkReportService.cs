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


    public async Task<bool> CreateAsync(
        int userId,
        CreateWorkReportDto dto)
    {
        await using var transaction =
            await _context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        try
        {

            var technician = await _context.Technicians
                .FirstOrDefaultAsync(t =>
                    t.UserId == userId &&
                    t.IsActive);

            if (technician == null)
                return false;


            var request = await _context.ServiceRequests
                .FirstOrDefaultAsync(sr =>
                    sr.Id == dto.ServiceRequestId);

            if (request == null)
                return false;


            if (request.TechnicianId != technician.Id)
                return false;


            if (request.Status != "Completed")
                return false;


            var reportExists = await _context.WorkReports
                .AnyAsync(w =>
                    w.ServiceRequestId == dto.ServiceRequestId);

            if (reportExists)
                return false;


            if (dto.Parts
                .GroupBy(p => p.InventoryItemId)
                .Any(g => g.Count() > 1))
            {
                return false;
            }


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


            foreach (var part in dto.Parts)
            {
                if (part.Quantity <= 0)
                    return false;

                var inventoryItem = inventoryItems
                    .First(i =>
                        i.Id == part.InventoryItemId);

                if (inventoryItem.QuantityInStock <
                    part.Quantity)
                {
                    return false;
                }
            }


            var report = new WorkReport
            {
                ServiceRequestId =
                    dto.ServiceRequestId,

                TechnicianId =
                    technician.Id,

                Diagnosis =
                    dto.Diagnosis.Trim(),

                WorkPerformed =
                    dto.WorkPerformed.Trim(),

                LabourHours =
                    dto.LabourHours,

                SuggestedLabourCharge =
                    dto.SuggestedLabourCharge,

                Resolution =
                    dto.Resolution.Trim(),

                CustomerSignature =
                    dto.CustomerSignature?.Trim()
                    ?? string.Empty,

                TechnicianRemarks =
                    dto.TechnicianRemarks?.Trim()
                    ?? string.Empty,

                WarrantyDays =
                    dto.WarrantyDays,

                ManagerReviewStatus =
                    "Pending",

                CorrectionReason =
                    null,

                SubmittedAt =
                    DateTime.UtcNow
            };


            _context.WorkReports.Add(report);

            await _context.SaveChangesAsync();


            foreach (var part in dto.Parts)
            {
                var inventoryItem = inventoryItems
                    .First(i =>
                        i.Id == part.InventoryItemId);


                var totalPrice =
                    inventoryItem.UnitPrice *
                    part.Quantity;


                var reportPart = new WorkReportPart
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
                    reportPart);


                inventoryItem.QuantityInStock -=
                    part.Quantity;

                inventoryItem.UpdatedAt =
                    DateTime.UtcNow;


                var movement = new StockMovement
                {
                    InventoryItemId =
                        inventoryItem.Id,

                    QuantityChange =
                        -part.Quantity,

                    QuantityAfterChange =
                        inventoryItem.QuantityInStock,

                    Reason =
                        $"Used in Work Report #{report.Id}",

                    UserId =
                        userId,

                    CreatedAt =
                        DateTime.UtcNow
                };


                _context.StockMovements.Add(
                    movement);
            }


            await _context.SaveChangesAsync();


            var managerIds = await _context.Users
                .Where(u =>
                    u.Role == "Manager" &&
                    u.IsActive)
                .Select(u => u.Id)
                .ToListAsync();


            foreach (var managerId in managerIds)
            {
                var notification = new Notification
                {
                    UserId =
                        managerId,

                    Title =
                        "New Work Report Submitted",

                    Message =
                        $"A new work report #{report.Id} has been submitted and is waiting for your review.",

                    Type =
                        "WorkReport",

                    RelatedEntityType =
                        "WorkReport",

                    RelatedEntityId =
                        report.Id,

                    IsRead =
                        false,

                    CreatedAt =
                        DateTime.UtcNow
                };


                _context.Notifications.Add(
                    notification);
            }


            var lowStockItems = inventoryItems
                .Where(i =>
                    i.IsActive &&
                    i.QuantityInStock <= i.ReorderLevel)
                .ToList();


            foreach (var item in lowStockItems)
            {
                foreach (var managerId in managerIds)
                {
                    var notification = new Notification
                    {
                        UserId =
                            managerId,

                        Title =
                            "Low Stock Alert",

                        Message =
                            $"Inventory item '{item.Name}' (SKU: {item.SKU}) is low on stock. Current stock: {item.QuantityInStock}. Reorder level: {item.ReorderLevel}.",

                        Type =
                            "Inventory",

                        RelatedEntityType =
                            "InventoryItem",

                        RelatedEntityId =
                            item.Id,

                        IsRead =
                            false,

                        CreatedAt =
                            DateTime.UtcNow
                    };


                    _context.Notifications.Add(
                        notification);
                }
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


    public async Task<List<WorkReportDto>> GetMyReportsAsync(
        int userId)
    {
        var reports = await _context.WorkReports

            .AsNoTracking()

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

            .OrderByDescending(w =>
                w.SubmittedAt)

            .ToListAsync();


        return reports
            .Select(MapToDto)
            .ToList();
    }


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

            var technician = await _context.Technicians
                .FirstOrDefaultAsync(t =>
                    t.UserId == userId &&
                    t.IsActive);

            if (technician == null)
                return false;


            var report = await _context.WorkReports
                .Include(w => w.Parts)
                .FirstOrDefaultAsync(w =>
                    w.Id == reportId &&
                    w.TechnicianId == technician.Id);

            if (report == null)
                return false;


            if (report.ManagerReviewStatus !=
                "CorrectionRequired")
            {
                return false;
            }


            if (dto.Parts
                .GroupBy(p => p.InventoryItemId)
                .Any(g => g.Count() > 1))
            {
                return false;
            }


            var inventoryIds = dto.Parts
                .Select(p => p.InventoryItemId)
                .Distinct()
                .ToList();


            var inventoryItems = await _context.InventoryItems
                .Where(i =>
                    inventoryIds.Contains(i.Id) &&
                    i.IsActive)
                .ToListAsync();


            if (inventoryItems.Count !=
                inventoryIds.Count)
            {
                return false;
            }


            foreach (var oldPart in report.Parts)
            {
                var oldInventoryItem =
                    await _context.InventoryItems
                        .FirstOrDefaultAsync(i =>
                            i.Id ==
                            oldPart.InventoryItemId);

                if (oldInventoryItem == null)
                    return false;


                oldInventoryItem.QuantityInStock +=
                    oldPart.Quantity;

                oldInventoryItem.UpdatedAt =
                    DateTime.UtcNow;


                var restoreMovement =
                    new StockMovement
                    {
                        InventoryItemId =
                            oldInventoryItem.Id,

                        QuantityChange =
                            oldPart.Quantity,

                        QuantityAfterChange =
                            oldInventoryItem.QuantityInStock,

                        Reason =
                            $"Stock restored during correction of Work Report #{report.Id}",

                        UserId =
                            userId,

                        CreatedAt =
                            DateTime.UtcNow
                    };


                _context.StockMovements.Add(
                    restoreMovement);
            }


            foreach (var part in dto.Parts)
            {
                if (part.Quantity <= 0)
                    return false;


                var inventoryItem =
                    inventoryItems.First(i =>
                        i.Id == part.InventoryItemId);


                if (inventoryItem.QuantityInStock <
                    part.Quantity)
                {
                    return false;
                }
            }


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


            _context.WorkReportParts.RemoveRange(
                report.Parts);


            foreach (var part in dto.Parts)
            {
                var inventoryItem =
                    inventoryItems.First(i =>
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


                inventoryItem.QuantityInStock -=
                    part.Quantity;

                inventoryItem.UpdatedAt =
                    DateTime.UtcNow;


                var movement =
                    new StockMovement
                    {
                        InventoryItemId =
                            inventoryItem.Id,

                        QuantityChange =
                            -part.Quantity,

                        QuantityAfterChange =
                            inventoryItem.QuantityInStock,

                        Reason =
                            $"Used in corrected Work Report #{report.Id}",

                        UserId =
                            userId,

                        CreatedAt =
                            DateTime.UtcNow
                    };


                _context.StockMovements.Add(
                    movement);
            }


            report.ManagerReviewStatus =
                "Pending";

            report.CorrectionReason =
                null;


            await _context.SaveChangesAsync();


            var managerIds = await _context.Users
                .Where(u =>
                    u.Role == "Manager" &&
                    u.IsActive)
                .Select(u => u.Id)
                .ToListAsync();


            foreach (var managerId in managerIds)
            {
                var notification = new Notification
                {
                    UserId =
                        managerId,

                    Title =
                        "Work Report Corrected",

                    Message =
                        $"Work report #{report.Id} has been corrected and resubmitted for review.",

                    Type =
                        "WorkReport",

                    RelatedEntityType =
                        "WorkReport",

                    RelatedEntityId =
                        report.Id,

                    IsRead =
                        false,

                    CreatedAt =
                        DateTime.UtcNow
                };


                _context.Notifications.Add(
                    notification);
            }


            var lowStockItems =
                inventoryItems
                    .Where(i =>
                        i.IsActive &&
                        i.QuantityInStock <=
                        i.ReorderLevel)
                    .ToList();


            foreach (var item in lowStockItems)
            {
                foreach (var managerId in managerIds)
                {
                    var notification =
                        new Notification
                        {
                            UserId =
                                managerId,

                            Title =
                                "Low Stock Alert",

                            Message =
                                $"Inventory item '{item.Name}' (SKU: {item.SKU}) is low on stock. Current stock: {item.QuantityInStock}. Reorder level: {item.ReorderLevel}.",

                            Type =
                                "Inventory",

                            RelatedEntityType =
                                "InventoryItem",

                            RelatedEntityId =
                                item.Id,

                            IsRead =
                                false,

                            CreatedAt =
                                DateTime.UtcNow
                        };


                    _context.Notifications.Add(
                        notification);
                }
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


    public async Task<List<WorkReportDto>> GetAllAsync()
    {
        var reports = await _context.WorkReports

            .AsNoTracking()

            .Include(w => w.Technician)
                .ThenInclude(t => t.User)

            .Include(w => w.ServiceRequest)
                .ThenInclude(sr => sr.Customer)

            .Include(w => w.ServiceRequest)
                .ThenInclude(sr => sr.Service)

            .Include(w => w.Parts)
                .ThenInclude(p => p.InventoryItem)

            .OrderByDescending(w =>
                w.SubmittedAt)

            .ToListAsync();


        return reports
            .Select(MapToDto)
            .ToList();
    }


    public async Task<WorkReportDto?> GetByIdAsync(
        int id)
    {
        var report = await _context.WorkReports

            .AsNoTracking()

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


    public async Task<WorkReportDto?> GetByServiceRequestIdAsync(
        int serviceRequestId)
    {
        var report = await _context.WorkReports
            .AsNoTracking()
            .Include(w => w.Technician)
                .ThenInclude(t => t.User)
            .Include(w => w.ServiceRequest)
                .ThenInclude(sr => sr.Customer)
            .Include(w => w.ServiceRequest)
                .ThenInclude(sr => sr.Service)
            .Include(w => w.Parts)
                .ThenInclude(p => p.InventoryItem)
            .FirstOrDefaultAsync(w =>
                w.ServiceRequestId == serviceRequestId);

        if (report == null)
            return null;

        return MapToDto(report);
    }


    public async Task<bool> ApproveAsync(
        int reportId)
    {
        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            var report = await _context.WorkReports
                .Include(w => w.Technician)
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


            var notification = new Notification
            {
                UserId =
                    report.Technician.UserId,

                Title =
                    "Work Report Approved",

                Message =
                    $"Your work report #{report.Id} has been approved by the manager.",

                Type =
                    "WorkReport",

                RelatedEntityType =
                    "WorkReport",

                RelatedEntityId =
                    report.Id,

                IsRead =
                    false,

                CreatedAt =
                    DateTime.UtcNow
            };


            _context.Notifications.Add(
                notification);


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


    public async Task<bool> RequestCorrectionAsync(
        int reportId,
        string correctionReason)
    {
        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            var report = await _context.WorkReports
                .Include(w => w.Technician)
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


            var notification = new Notification
            {
                UserId =
                    report.Technician.UserId,

                Title =
                    "Work Report Correction Required",

                Message =
                    $"Your work report #{report.Id} requires correction. Reason: {correctionReason.Trim()}",

                Type =
                    "WorkReport",

                RelatedEntityType =
                    "WorkReport",

                RelatedEntityId =
                    report.Id,

                IsRead =
                    false,

                CreatedAt =
                    DateTime.UtcNow
            };


            _context.Notifications.Add(
                notification);


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


    public async Task<List<WorkReportDto>> GetByStatusAsync(
        string status)
    {
        if (string.IsNullOrWhiteSpace(status))
            return new List<WorkReportDto>();


        var reports = await _context.WorkReports

            .AsNoTracking()

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


    public async Task<object> GetDashboardAsync()
    {
        var reports = await _context.WorkReports
            .AsNoTracking()
            .Include(w => w.Parts)
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


    public async Task<bool> AddPartAsync(
        int workReportId,
        int userId,
        AddWorkReportPartDto dto)
    {
        await using var transaction =
            await _context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        try
        {
            if (dto.Quantity <= 0)
                return false;


            var workReport = await _context.WorkReports
                .Include(w => w.Technician)
                .FirstOrDefaultAsync(w =>
                    w.Id == workReportId &&
                    w.Technician.UserId == userId);

            if (workReport == null)
                return false;


            if (workReport.ManagerReviewStatus ==
                "Approved")
            {
                return false;
            }


            var item = await _context.InventoryItems
                .FirstOrDefaultAsync(i =>
                    i.Id == dto.InventoryItemId &&
                    i.IsActive);

            if (item == null)
                return false;


            if (item.QuantityInStock <
                dto.Quantity)
            {
                return false;
            }


            var alreadyExists =
                await _context.WorkReportParts
                    .AnyAsync(p =>
                        p.WorkReportId ==
                            workReportId &&
                        p.InventoryItemId ==
                            dto.InventoryItemId);

            if (alreadyExists)
                return false;


            var totalPrice =
                item.UnitPrice *
                dto.Quantity;


            var part = new WorkReportPart
            {
                WorkReportId =
                    workReport.Id,

                InventoryItemId =
                    item.Id,

                Quantity =
                    dto.Quantity,

                UnitPrice =
                    item.UnitPrice,

                TotalPrice =
                    totalPrice
            };


            item.QuantityInStock -=
                dto.Quantity;

            item.UpdatedAt =
                DateTime.UtcNow;


            var movement = new StockMovement
            {
                InventoryItemId =
                    item.Id,

                QuantityChange =
                    -dto.Quantity,

                QuantityAfterChange =
                    item.QuantityInStock,

                Reason =
                    $"Used in Work Report #{workReport.Id}",

                UserId =
                    userId,

                CreatedAt =
                    DateTime.UtcNow
            };


            _context.WorkReportParts.Add(
                part);

            _context.StockMovements.Add(
                movement);


            await _context.SaveChangesAsync();


            if (item.QuantityInStock <=
                item.ReorderLevel)
            {
                var managerIds = await _context.Users
                    .Where(u =>
                        u.Role == "Manager" &&
                        u.IsActive)
                    .Select(u => u.Id)
                    .ToListAsync();


                foreach (var managerId in managerIds)
                {
                    var notification =
                        new Notification
                        {
                            UserId =
                                managerId,

                            Title =
                                "Low Stock Alert",

                            Message =
                                $"Inventory item '{item.Name}' (SKU: {item.SKU}) is low on stock. Current stock: {item.QuantityInStock}. Reorder level: {item.ReorderLevel}.",

                            Type =
                                "Inventory",

                            RelatedEntityType =
                                "InventoryItem",

                            RelatedEntityId =
                                item.Id,

                            IsRead =
                                false,

                            CreatedAt =
                                DateTime.UtcNow
                        };


                    _context.Notifications.Add(
                        notification);
                }


                await _context.SaveChangesAsync();
            }


            await transaction.CommitAsync();

            return true;
        }
        catch
        {
            await transaction.RollbackAsync();

            return false;
        }
    }


    public async Task<bool> RemovePartAsync(
        int workReportId,
        int partId,
        int userId)
    {
        await using var transaction =
            await _context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        try
        {
            var workReport = await _context.WorkReports
                .Include(w => w.Technician)
                .FirstOrDefaultAsync(w =>
                    w.Id == workReportId &&
                    w.Technician.UserId == userId);

            if (workReport == null)
                return false;


            if (workReport.ManagerReviewStatus ==
                "Approved")
            {
                return false;
            }


            var part = await _context.WorkReportParts
                .Include(p => p.InventoryItem)
                .FirstOrDefaultAsync(p =>
                    p.Id == partId &&
                    p.WorkReportId == workReportId);

            if (part == null)
                return false;


            var item = part.InventoryItem;


            item.QuantityInStock +=
                part.Quantity;

            item.UpdatedAt =
                DateTime.UtcNow;


            var movement = new StockMovement
            {
                InventoryItemId =
                    item.Id,

                QuantityChange =
                    part.Quantity,

                QuantityAfterChange =
                    item.QuantityInStock,

                Reason =
                    $"Part removed from Work Report #{workReportId}",

                UserId =
                    userId,

                CreatedAt =
                    DateTime.UtcNow
            };


            _context.WorkReportParts.Remove(
                part);

            _context.StockMovements.Add(
                movement);


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


    private static WorkReportDto MapToDto(
        WorkReport w)
    {
        return new WorkReportDto
        {
            Id =
                w.Id,

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

            Parts =
                w.Parts
                    .Select(p =>
                        new WorkReportPartDto
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
}