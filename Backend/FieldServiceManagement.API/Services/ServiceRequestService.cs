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
    

    // CUSTOMER THINGS
    
    // Create Service Request
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


    // Get Customer's Requests
    public async Task<List<ServiceRequestDto>> GetCustomerRequestsAsync(
        int customerId)
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


    // Get Customer Request By ID
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


    // Update Customer Request
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


    // Cancel Customer Request
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


    // Customer Dashboard
    public async Task<object> GetCustomerDashboardAsync(
        int customerId)
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


    
    // OWNER / MANAGER THINGS

    // Get All Service Requests
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


    // Get Service Request By ID
    public async Task<ServiceRequestDto?> GetByIdAsync(int id)
    {
        var request = await _context.ServiceRequests
            .Include(sr => sr.Customer)
            .Include(sr => sr.Service)
            .Include(sr => sr.Technician)
            .ThenInclude(t => t!.User)
            .FirstOrDefaultAsync(sr => sr.Id == id);

        if (request == null)
            return null;

        return new ServiceRequestDto
        {
            Id = request.Id,

            CustomerName = request.Customer.FullName,

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


    // Get Requests By Status
    public async Task<List<ServiceRequestDto>> GetByStatusAsync(
        string status)
    {
        var requests = await _context.ServiceRequests
            .Include(sr => sr.Customer)
            .Include(sr => sr.Service)
            .Include(sr => sr.Technician)
            .ThenInclude(t => t!.User)
            .Where(sr => sr.Status == status)
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


    // Search Service Requests
    public async Task<List<ServiceRequestDto>> SearchAsync(
        string name)
    {
        var requests = await _context.ServiceRequests
            .Include(sr => sr.Customer)
            .Include(sr => sr.Service)
            .Include(sr => sr.Technician)
            .ThenInclude(t => t!.User)
            .Where(sr =>
                sr.Customer.FullName.Contains(name) ||
                sr.Service.ServiceName.Contains(name))
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


    // Assign Technician
    public async Task<bool> AssignTechnicianAsync(
        int requestId,
        AssignTechnicianDto dto)
    {
        var request = await _context.ServiceRequests
            .Include(x => x.Technician)
            .FirstOrDefaultAsync(x => x.Id == requestId);

        if (request == null)
            return false;

        if (request.Status != "Pending" &&
            request.Status != "Assigned")
        {
            return false;
        }

        var newTechnician = await _context.Technicians
            .FirstOrDefaultAsync(x =>
                x.Id == dto.TechnicianId &&
                x.IsActive &&
                x.IsAvailable);

        if (newTechnician == null)
            return false;

        // If another technician is already assigned
        if (request.TechnicianId != null &&
            request.TechnicianId != newTechnician.Id)
        {
            var oldTechnician = request.Technician;

            if (oldTechnician != null &&
                oldTechnician.ActiveJobs > 0)
            {
                oldTechnician.ActiveJobs--;
            }
        }

        // If the same technician is already assigned
        if (request.TechnicianId == newTechnician.Id)
            return false;

        request.TechnicianId = newTechnician.Id;

        request.Status = "Assigned";

        request.UpdatedAt = DateTime.UtcNow;

        newTechnician.TotalJobs++;

        newTechnician.ActiveJobs++;

        await _context.SaveChangesAsync();

        return true;
    }

    
    // TECHNICIAN THINGS

    // Get Technician's Requests
    public async Task<List<ServiceRequestDto>> GetTechnicianRequestsAsync(
        int userId)
    {
        var requests = await _context.ServiceRequests
            .Include(sr => sr.Customer)
            .Include(sr => sr.Service)
            .Include(sr => sr.Technician)
            .ThenInclude(t => t!.User)
            .Where(sr =>
                sr.Technician != null &&
                sr.Technician.UserId == userId)
            .OrderByDescending(sr => sr.CreatedAt)
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

    
    

    // Start Job
    public async Task<bool> StartRequestAsync(
        int requestId,
        int userId)
    {
        var request = await _context.ServiceRequests
            .Include(sr => sr.Technician)
            .FirstOrDefaultAsync(sr =>
                sr.Id == requestId &&
                sr.Technician != null &&
                sr.Technician.UserId == userId);

        if (request == null)
            return false;

        if (request.Status != "Assigned")
            return false;

        request.Status = "InProgress";

        request.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }


    // Complete Request By Technician
    public async Task<bool> CompleteRequestAsync(
        int requestId,
        int userId)
    {
        var request = await _context.ServiceRequests
            .Include(sr => sr.Technician)
            .FirstOrDefaultAsync(sr =>
                sr.Id == requestId &&
                sr.Technician != null &&
                sr.Technician.UserId == userId);

        if (request == null)
            return false;

        if (request.Status != "InProgress")
            return false;

        request.Status = "Completed";

        request.UpdatedAt = DateTime.UtcNow;

        request.Technician!.ActiveJobs--;

        request.Technician.CompletedJobs++;

        await _context.SaveChangesAsync();

        return true;
    }


    
    // OWNER / MANAGER DASHBOARD


    public async Task<ServiceRequestDashboardDto> GetDashboardAsync()
    {
        var requests = await _context.ServiceRequests
            .ToListAsync();

        return new ServiceRequestDashboardDto
        {
            TotalRequests = requests.Count,

            PendingRequests = requests.Count(x =>
                x.Status == "Pending"),

            AssignedRequests = requests.Count(x =>
                x.Status == "Assigned"),

            InProgressRequests = requests.Count(x =>
                x.Status == "InProgress"),

            CompletedRequests = requests.Count(x =>
                x.Status == "Completed"),

            CancelledRequests = requests.Count(x =>
                x.Status == "Cancelled")
        };
    }
}