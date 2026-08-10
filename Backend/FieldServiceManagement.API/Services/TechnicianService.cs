namespace FieldServiceManagement.API.Services;
using FieldServiceManagement.API.Data;
using FieldServiceManagement.API.DTOs.Technicians;
using FieldServiceManagement.API.Models;
using Microsoft.EntityFrameworkCore;
public class TechnicianService
{
    private readonly AppDbContext _context;

    public TechnicianService(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task<List<TechnicianDto>> GetAllAsync()
    {
        var technicians = await _context.Technicians
            .Where(t => t.IsActive)
            .Include(t => t.User)
            .ToListAsync();

        return technicians.Select(t => new TechnicianDto
        {
            Id = t.Id,

            UserId = t.UserId,

            FullName = t.User.FullName,

            Email = t.User.Email,

            PhoneNumber = t.User.PhoneNumber,

            EmployeeCode = t.EmployeeCode,

            Specialization = t.Specialization,

            ExperienceYears = t.ExperienceYears,

            Rating = t.Rating,

            TotalJobs = t.TotalJobs,

            ActiveJobs = t.ActiveJobs,

            CompletedJobs = t.CompletedJobs,

            IsAvailable = t.IsAvailable,

            IsActive = t.IsActive,

            Status = t.Status,

            CurrentLocation = t.CurrentLocation,

            JoiningDate = t.JoiningDate

        }).ToList();
    }
    
    public async Task<TechnicianDto?> GetByIdAsync(int id)
    {
        var technician = await _context.Technicians
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (technician == null)
            return null;

        return new TechnicianDto
        {
            Id = technician.Id,

            UserId = technician.UserId,

            FullName = technician.User.FullName,

            Email = technician.User.Email,

            PhoneNumber = technician.User.PhoneNumber,

            EmployeeCode = technician.EmployeeCode,

            Specialization = technician.Specialization,

            ExperienceYears = technician.ExperienceYears,

            Rating = technician.Rating,

            TotalJobs = technician.TotalJobs,

            ActiveJobs = technician.ActiveJobs,

            CompletedJobs = technician.CompletedJobs,

            IsAvailable = technician.IsAvailable,

            IsActive = technician.IsActive,

            Status = technician.Status,

            CurrentLocation = technician.CurrentLocation,

            JoiningDate = technician.JoiningDate
        };
    }
    
    public async Task<bool> CreateAsync(CreateTechnicianDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == dto.UserId);

        if (user == null)
            return false;

        if (user.Role != "Technician")
            return false;

        var codeExists = await _context.Technicians
            .AnyAsync(x => x.EmployeeCode == dto.EmployeeCode);

        if (codeExists)
            return false;

        var alreadyTechnician = await _context.Technicians
            .AnyAsync(x => x.UserId == dto.UserId);

        if (alreadyTechnician)
            return false;

        var technician = new Technician
        {
            UserId = dto.UserId,

            EmployeeCode = dto.EmployeeCode,

            Specialization = dto.Specialization,

            ExperienceYears = dto.ExperienceYears,

            CurrentLocation = dto.CurrentLocation,

            Notes = dto.Notes,

            Status = "Available",

            IsAvailable = true,

            IsActive = true,

            CreatedAt = DateTime.UtcNow,

            JoiningDate = DateTime.UtcNow
        };

        _context.Technicians.Add(technician);

        await _context.SaveChangesAsync();

        return true;
    }
    
    public async Task<bool> UpdateAsync(int id, UpdateTechnicianDto dto)
    {
        var technician = await _context.Technicians
            .FirstOrDefaultAsync(t => t.Id == id);

        if (technician == null)
            return false;

        technician.Specialization = dto.Specialization;
        technician.ExperienceYears = dto.ExperienceYears;
        technician.CurrentLocation = dto.CurrentLocation;
        technician.Notes = dto.Notes;
        technician.IsAvailable = dto.IsAvailable;
        technician.IsActive = dto.IsActive;
        technician.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }
    
    public async Task<bool> DeactivateAsync(int id)
    {
        var technician = await _context.Technicians
            .FirstOrDefaultAsync(t => t.Id == id);

        if (technician == null)
            return false;

        if (!technician.IsActive)
            return false;

        technician.IsActive = false;
        technician.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }
    
    public async Task<bool> ToggleStatusAsync(int id)
    {
        var technician = await _context.Technicians
            .FirstOrDefaultAsync(t => t.Id == id);

        if (technician == null)
            return false;

        technician.IsActive = !technician.IsActive;
        technician.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }
    
    public async Task<bool> ChangeWorkStatusAsync(
        int id,
        ChangeWorkStatusDto dto)
    {
        var technician = await _context.Technicians
            .FirstOrDefaultAsync(t => t.Id == id);

        if (technician == null)
            return false;
        
        if (dto.Status != "Available" &&
            dto.Status != "Busy" &&
            dto.Status != "On Leave")
        {
            return false;
        }
        
        if (dto.Status != "Available" &&
            dto.Status != "Busy" &&
            dto.Status != "On Leave")
        {
            return false;
        }

        technician.Status = dto.Status;

        technician.IsAvailable = dto.Status == "Available";

        technician.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }
    
    
    public async Task<bool> ChangeMyStatusAsync(
        int userId,
        ChangeWorkStatusDto dto)
    {
        var technician = await _context.Technicians
            .FirstOrDefaultAsync(t => t.UserId == userId);

        if (technician == null)
            return false;

        if (dto.Status != "Available" &&
            dto.Status != "Busy" &&
            dto.Status != "On Leave")
        {
            return false;
        }

        technician.Status = dto.Status;

        technician.IsAvailable = dto.Status == "Available";

        technician.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }
    
    
    public async Task<List<TechnicianDropdownDto>> GetDropdownAsync()
    {
        var technicians = await _context.Technicians
            .Include(t => t.User)
            .Where(t => t.IsActive && t.IsAvailable)
            .OrderBy(t => t.User.FirstName)
            .ToListAsync();

        return technicians.Select(t => new TechnicianDropdownDto
        {
            Id = t.Id,

            FullName = t.User.FullName,

            EmployeeCode = t.EmployeeCode

        }).ToList();
    }
    
    
}