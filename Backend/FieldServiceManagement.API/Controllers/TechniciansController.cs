using FieldServiceManagement.API.DTOs.Technicians;
using FieldServiceManagement.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
namespace FieldServiceManagement.API.Controllers;

[Authorize(Roles = "Owner,Manager")]
[Route("api/[controller]")]
[ApiController]
public class TechniciansController : ControllerBase
{
    private readonly TechnicianService _technicianService;

    public TechniciansController(TechnicianService technicianService)
    {
        _technicianService = technicianService;
    }
    
    [Authorize(Roles = "Owner,Manager")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var technicians = await _technicianService.GetAllAsync();

        return Ok(new
        {
            success = true,
            count = technicians.Count,
            data = technicians
        });
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var technician = await _technicianService.GetByIdAsync(id);

        if (technician == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Technician not found."
            });
        }

        return Ok(new
        {
            success = true,
            data = technician
        });
    }
    
    
    // public async Task<List<TechnicianDto>> SearchAsync(string name)
    // {
    //     var technicians = await _context.Technicians
    //         .Include(t => t.User)
    //         .Where(t => t.IsActive &&
    //                     (t.User.FirstName.Contains(name) ||
    //                      t.User.LastName.Contains(name)))
    //         .ToListAsync();
    //
    //     return technicians.Select(t => new TechnicianDto
    //     {
    //         Id = t.Id,
    //         UserId = t.UserId,
    //         FullName = t.User.FullName,
    //         Email = t.User.Email,
    //         PhoneNumber = t.User.PhoneNumber,
    //         EmployeeCode = t.EmployeeCode,
    //         Specialization = t.Specialization,
    //         ExperienceYears = t.ExperienceYears,
    //         Rating = t.Rating,
    //         TotalJobs = t.TotalJobs,
    //         ActiveJobs = t.ActiveJobs,
    //         CompletedJobs = t.CompletedJobs,
    //         IsAvailable = t.IsAvailable,
    //         IsActive = t.IsActive,
    //         Status = t.Status,
    //         CurrentLocation = t.CurrentLocation,
    //         JoiningDate = t.JoiningDate
    //     }).ToList();
    // }
    
    [Authorize(Roles = "Owner")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateTechnicianDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _technicianService.CreateAsync(dto);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message = "Unable to create technician."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Technician created successfully."
        });
    }
    
    [Authorize(Roles = "Owner,Manager")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        UpdateTechnicianDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _technicianService.UpdateAsync(id, dto);

        if (!result)
        {
            return NotFound(new
            {
                success = false,
                message = "Technician not found."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Technician updated successfully."
        });
    }
    
    [Authorize(Roles = "Owner")]
    [HttpPatch("{id}/deactivate")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var result = await _technicianService.DeactivateAsync(id);

        if (!result)
        {
            return NotFound(new
            {
                success = false,
                message = "Technician not found or already inactive."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Technician deactivated successfully."
        });
    }
    
    [Authorize(Roles = "Owner")]
    [HttpPatch("{id}/toggle")]
    public async Task<IActionResult> Toggle(int id)
    {
        var result = await _technicianService.ToggleStatusAsync(id);

        if (!result)
        {
            return NotFound(new
            {
                success = false,
                message = "Technician not found."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Technician status updated successfully."
        });
    }
    
    [Authorize(Roles = "Owner,Manager")]
    [HttpPatch("{id}/work-status")]
    public async Task<IActionResult> ChangeWorkStatus(
        int id,
        ChangeWorkStatusDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _technicianService
            .ChangeWorkStatusAsync(id, dto);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message = "Unable to update technician status."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Status updated successfully."
        });
    }
    
    [Authorize(Roles = "Owner,Manager")]
    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown()
    {
        var technicians =
            await _technicianService.GetDropdownAsync();

        return Ok(new
        {
            success = true,
            data = technicians
        });
    }
    
    [Authorize(Roles = "Technician")]
    [HttpPatch("my-status")]
    public async Task<IActionResult> ChangeMyStatus(ChangeWorkStatusDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

        var result = await _technicianService.ChangeMyStatusAsync(userId, dto);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message = "Unable to update your status."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Your status updated successfully."
        });
    }
    

}