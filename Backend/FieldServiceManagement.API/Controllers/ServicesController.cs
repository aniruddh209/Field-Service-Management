using FieldServiceManagement.API.Data;
using FieldServiceManagement.API.Models;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldServiceManagement.API.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class ServicesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IValidator<Service> _serviceValidator;

    public ServicesController(
        AppDbContext context,
        IValidator<Service> serviceValidator)
    {
        _context = context;
        _serviceValidator = serviceValidator;
    }

    [HttpGet]
    public IActionResult GetAllServices()
    {
        var services = _context.Services.ToList();

        return Ok(new
        {
            success = true,
            count = services.Count,
            data = services
        });
    }

    [Authorize(Roles = "Customer")]
    [HttpGet("available")]
    public IActionResult GetAvailableServices()
    {
        var services = _context.Services
            .Where(x => x.IsActive)
            .ToList();

        return Ok(new
        {
            success = true,
            count = services.Count,
            data = services
        });
    }

    [HttpGet("search")]
    public IActionResult SearchService(string name)
    {
        var services = _context.Services
            .Where(x => x.ServiceName.ToLower().Contains(name.ToLower()))
            .ToList();

        if (!services.Any())
        {
            return NotFound(new
            {
                success = false,
                message = "No services found."
            });
        }

        return Ok(new
        {
            success = true,
            count = services.Count,
            data = services
        });
    }

    [HttpGet("{id}")]
    public IActionResult GetServiceById(int id)
    {
        var service = _context.Services.Find(id);

        if (service == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Service not found."
            });
        }

        return Ok(new
        {
            success = true,
            data = service
        });
    }

    [HttpPost]
    public async Task<IActionResult> InsertService(Service service)
    {
        var validationResult = await _serviceValidator.ValidateAsync(service);
        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Validation failed.",
                errors = validationResult.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage })
            });
        }

        var existingService = _context.Services
            .FirstOrDefault(x => x.ServiceName == service.ServiceName);

        if (existingService != null)
        {
            return Conflict(new
            {
                success = false,
                message = "Service name already exists."
            });
        }

        _context.Services.Add(service);
        _context.SaveChanges();

        return CreatedAtAction(
            nameof(GetServiceById),
            new { id = service.Id },
            new
            {
                success = true,
                message = "Service created successfully.",
                data = service
            }
        );
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateService(int id, Service service)
    {
        if (id != service.Id)
        {
            return BadRequest(new
            {
                success = false,
                message = "Service ID mismatch."
            });
        }

        var validationResult = await _serviceValidator.ValidateAsync(service);
        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Validation failed.",
                errors = validationResult.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage })
            });
        }

        var existingService = _context.Services.Find(id);

        if (existingService == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Service not found."
            });
        }

        var duplicateService = _context.Services.FirstOrDefault(x =>
            x.ServiceName == service.ServiceName &&
            x.Id != id);

        if (duplicateService != null)
        {
            return Conflict(new
            {
                success = false,
                message = "Service name already exists."
            });
        }

        existingService.ServiceName = service.ServiceName;
        existingService.Category = service.Category;
        existingService.Description = service.Description;
        existingService.BasePrice = service.BasePrice;
        existingService.EstimatedHours = service.EstimatedHours;
        existingService.Image = service.Image;
        existingService.IsActive = service.IsActive;

        _context.SaveChanges();

        return Ok(new
        {
            success = true,
            message = "Service updated successfully."
        });
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteService(int id)
    {
        var service = _context.Services.Find(id);

        if (service == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Service not found."
            });
        }

        _context.Services.Remove(service);
        _context.SaveChanges();

        return Ok(new
        {
            success = true,
            message = "Service deleted successfully."
        });
    }

    [HttpPatch("{id}/toggle")]
    public IActionResult ToggleServiceStatus(int id)
    {
        var service = _context.Services.Find(id);

        if (service == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Service not found."
            });
        }

        service.IsActive = !service.IsActive;

        _context.SaveChanges();

        return Ok(new
        {
            success = true,
            message = service.IsActive
                ? "Service Activated Successfully."
                : "Service Deactivated Successfully.",
            data = service
        });
    }
}
