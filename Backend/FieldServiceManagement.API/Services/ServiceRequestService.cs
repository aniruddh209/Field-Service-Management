using FieldServiceManagement.API.Data;
using FieldServiceManagement.API.DTOs.ServiceRequests;
using FieldServiceManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FieldServiceManagement.API.Services;

public class ServiceRequestService
{
    private readonly AppDbContext _context;

    public ServiceRequestService(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task<bool> CreateAsync(
        int customerId,
        CreateServiceRequestDto dto)
    {
        var service = await _context.Services
            .FirstOrDefaultAsync(s =>
                s.Id == dto.ServiceId &&
                s.IsActive);

        if (service == null)
            return false;

        var request = new ServiceRequest
        {
            CustomerId = customerId,
            ServiceId = dto.ServiceId,
            ProblemDescription = dto.ProblemDescription,
            ServiceAddress = dto.ServiceAddress,
            PreferredDate = dto.PreferredDate,
            Notes = dto.Notes,
            Status = "Pending",
            EstimatedPrice = 0,
            CreatedAt = DateTime.UtcNow
        };

        _context.ServiceRequests.Add(request);

        await _context.SaveChangesAsync();

        return true;
    }
    
    public async Task<List<ServiceRequestDto>> GetAllAsync()
    {
        var requests = await _context.ServiceRequests
            .Include(sr => sr.Customer)
            .Include(sr => sr.Service)
            .Include(sr => sr.Technician)
            .ThenInclude(t => t!.User)
            .ToListAsync();

        return requests.Select(sr => new ServiceRequestDto
        {
            Id = sr.Id,

            CustomerName = sr.Customer.FullName,

            ServiceName = sr.Service.ServiceName,

            TechnicianName = sr.Technician != null
                ? sr.Technician.User.FullName
                : null,

            ProblemDescription = sr.ProblemDescription,

            ServiceAddress = sr.ServiceAddress,

            PreferredDate = sr.PreferredDate,

            Status = sr.Status,

            EstimatedPrice = sr.EstimatedPrice

        }).ToList();
    }
    
    
    public async Task<List<ServiceRequestDto>> GetCustomerRequestsAsync(int customerId)
    {
        var requests = await _context.ServiceRequests
            .Include(sr => sr.Service)
            .Include(sr => sr.Technician)
            .ThenInclude(t => t!.User)
            .Where(sr => sr.CustomerId == customerId)
            .OrderByDescending(sr => sr.CreatedAt)
            .ToListAsync();

        return requests.Select(sr => new ServiceRequestDto
        {
            Id = sr.Id,

            ServiceName = sr.Service.ServiceName,

            TechnicianName = sr.Technician != null
                ? sr.Technician.User.FullName
                : null,

            ProblemDescription = sr.ProblemDescription,

            ServiceAddress = sr.ServiceAddress,

            PreferredDate = sr.PreferredDate,

            Status = sr.Status,

            EstimatedPrice = sr.EstimatedPrice

        }).ToList();
    }
    
    
    public async Task<ServiceRequestDto?> GetCustomerRequestByIdAsync(
        int requestId,
        int customerId)
    {
        var request = await _context.ServiceRequests
            .Include(sr => sr.Service)
            .Include(sr => sr.Technician)
            .ThenInclude(t => t!.User)
            .FirstOrDefaultAsync(sr =>
                sr.Id == requestId &&
                sr.CustomerId == customerId);

        if (request == null)
            return null;

        return new ServiceRequestDto
        {
            Id = request.Id,

            ServiceName = request.Service.ServiceName,

            TechnicianName = request.Technician != null
                ? request.Technician.User.FullName
                : null,

            ProblemDescription = request.ProblemDescription,

            ServiceAddress = request.ServiceAddress,

            PreferredDate = request.PreferredDate,

            Status = request.Status,

            EstimatedPrice = request.EstimatedPrice
        };
    }
    
    public async Task<bool> UpdateAsync(
        int requestId,
        int customerId,
        UpdateServiceRequestDto dto)
    {
        var request = await _context.ServiceRequests
            .FirstOrDefaultAsync(sr =>
                sr.Id == requestId &&
                sr.CustomerId == customerId);

        if (request == null)
            return false;

        // Customer can update only pending requests
        if (request.Status != "Pending")
            return false;

        // Validate Service
        var service = await _context.Services
            .FirstOrDefaultAsync(s =>
                s.Id == dto.ServiceId &&
                s.IsActive);

        if (service == null)
            return false;

        request.ServiceId = dto.ServiceId;
        request.ProblemDescription = dto.ProblemDescription;
        request.ServiceAddress = dto.ServiceAddress;
        request.PreferredDate = dto.PreferredDate;
        request.Notes = dto.Notes;
        request.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }
    
    public async Task<bool> CancelAsync(
        int requestId,
        int customerId)
    {
        var request = await _context.ServiceRequests
            .FirstOrDefaultAsync(sr =>
                sr.Id == requestId &&
                sr.CustomerId == customerId);

        if (request == null)
            return false;

        // Only pending requests can be cancelled
        if (request.Status != "Pending")
            return false;

        request.Status = "Cancelled";
        request.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }
    
    public async Task<object> GetCustomerDashboardAsync(int customerId)
    {
        var requests = await _context.ServiceRequests
            .Where(x => x.CustomerId == customerId)
            .ToListAsync();

        return new
        {
            TotalRequests = requests.Count,

            PendingRequests = requests.Count(x =>
                x.Status == "Pending"),

            CompletedRequests = requests.Count(x =>
                x.Status == "Completed"),

            CancelledRequests = requests.Count(x =>
                x.Status == "Cancelled"),

            ActiveRequests = requests.Count(x =>
                x.Status != "Completed" &&
                x.Status != "Cancelled")
        };
    }
}