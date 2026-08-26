using System.Security.Claims;

using FieldServiceManagement.API.DTOs.Technicians;
using FieldServiceManagement.API.Services;

using FluentValidation;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldServiceManagement.API.Controllers;

[Authorize(Roles = "Owner,Manager")]
[Route("api/[controller]")]
[ApiController]
public class TechniciansController : ControllerBase
{
    private readonly TechnicianService _technicianService;

    private readonly IValidator<CreateTechnicianDto>
        _createTechnicianValidator;
    private readonly IValidator<UpdateTechnicianDto>
        _updateTechnicianValidator;
    

    public TechniciansController(
        TechnicianService technicianService,
        IValidator<CreateTechnicianDto> createTechnicianValidator,
        IValidator<UpdateTechnicianDto> updateTechnicianValidator)
    {
        _technicianService = technicianService;

        _createTechnicianValidator =
            createTechnicianValidator;

        _updateTechnicianValidator =
            updateTechnicianValidator;
    }

    

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var technicians =
            await _technicianService.GetAllAsync();

        return Ok(new
        {
            success = true,
            count = technicians.Count,
            data = technicians
        });
    }
    

    [HttpGet("search")]
    public async Task<IActionResult> Search(
        [FromQuery] string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new
            {
                success = false,
                message = "Search name is required."
            });
        }

        var technicians =
            await _technicianService.SearchAsync(name);

        if (technicians.Count == 0)
        {
            return NotFound(new
            {
                success = false,
                message = "No technicians found."
            });
        }

        return Ok(new
        {
            success = true,
            count = technicians.Count,
            data = technicians
        });
    }
    

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var technician =
            await _technicianService.GetByIdAsync(id);

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
    

    [Authorize(Roles = "Owner")]
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateTechnicianDto dto)
    {
        // FluentValidation
        var validationResult =
            await _createTechnicianValidator.ValidateAsync(dto);

        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Validation failed.",
                errors = validationResult.Errors
                    .Select(error => new
                    {
                        field = error.PropertyName,
                        message = error.ErrorMessage
                    })
            });
        }


        var result =
            await _technicianService.CreateAsync(dto);


        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message = "Unable to create technician."
            });
        }


        return StatusCode(201, new
        {
            success = true,
            message = "Technician created successfully."
        });
    }

    

    [Authorize(Roles = "Owner,Manager")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateTechnicianDto dto)
    {
        if (id <= 0)
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid technician ID."
            });
        }

        var validationResult =
            await _updateTechnicianValidator.ValidateAsync(dto);

        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Validation failed.",
                errors = validationResult.Errors
                    .Select(error => new
                    {
                        field = error.PropertyName,
                        message = error.ErrorMessage
                    })
            });
        }

        var result =
            await _technicianService.UpdateAsync(id, dto);

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
    [HttpPatch("{id:int}/deactivate")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var result =
            await _technicianService.DeactivateAsync(id);

        if (!result)
        {
            return NotFound(new
            {
                success = false,
                message =
                    "Technician not found or already inactive."
            });
        }

        return Ok(new
        {
            success = true,
            message =
                "Technician deactivated successfully."
        });
    }

    

    [Authorize(Roles = "Owner")]
    [HttpPatch("{id:int}/toggle")]
    public async Task<IActionResult> Toggle(int id)
    {
        var result =
            await _technicianService.ToggleStatusAsync(id);

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
            message =
                "Technician status updated successfully."
        });
    }

    

    [Authorize(Roles = "Owner,Manager")]
    [HttpPatch("{id:int}/work-status")]
    public async Task<IActionResult> ChangeWorkStatus(
        int id,
        [FromBody] ChangeWorkStatusDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result =
            await _technicianService
                .ChangeWorkStatusAsync(id, dto);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message =
                    "Unable to update technician status."
            });
        }

        return Ok(new
        {
            success = true,
            message =
                "Status updated successfully."
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
    public async Task<IActionResult> ChangeMyStatus(
        [FromBody] ChangeWorkStatusDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var claim =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (!int.TryParse(claim, out int userId))
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user identity."
            });
        }


        var result =
            await _technicianService
                .ChangeMyStatusAsync(userId, dto);


        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message =
                    "Unable to update your status."
            });
        }


        return Ok(new
        {
            success = true,
            message =
                "Your status updated successfully."
        });
    }

    

    [Authorize(Roles = "Technician")]
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var claim =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (!int.TryParse(claim, out int userId))
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user identity."
            });
        }


        var dashboard =
            await _technicianService
                .GetDashboardAsync(userId);


        if (dashboard == null)
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
            data = dashboard
        });
    }
}