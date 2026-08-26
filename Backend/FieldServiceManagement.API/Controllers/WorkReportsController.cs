using FieldServiceManagement.API.DTOs.WorkReports;
using FieldServiceManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FieldServiceManagement.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class WorkReportsController : ControllerBase
{
    private readonly WorkReportService _service;

    public WorkReportsController(WorkReportService service)
    {
        _service = service;
    }

    
    // TECHNICIAN THINGS

    // Create Work Report
    [Authorize(Roles = "Technician")]
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateWorkReportDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var result =
            await _service.CreateAsync(
                userId,
                dto);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message = "Unable to create work report."
            });
        }

        return StatusCode(201, new
        {
            success = true,
            message = "Work report created successfully."
        });
    }
    
    // Get technician's own work reports
    [Authorize(Roles = "Technician")]
    [HttpGet("technician/my")]
    public async Task<IActionResult> GetMyReports()
    {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var reports =
            await _service.GetMyReportsAsync(userId);

        return Ok(new
        {
            success = true,
            count = reports.Count,
            data = reports
        });
    }
    
    // Add part to work report
    [Authorize(Roles = "Technician")]
    [HttpPost("{id:int}/parts")]
    public async Task<IActionResult> AddPart(
        int id,
        [FromBody] AddWorkReportPartDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var result = await _service.AddPartAsync(
            id,
            userId,
            dto);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message = "Unable to add part. Check the work report, inventory item, or available stock."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Part added to work report successfully."
        });
    }
    
    // Remove part from work report
    [Authorize(Roles = "Technician")]
    [HttpDelete("{id:int}/parts/{partId:int}")]
    public async Task<IActionResult> RemovePart(
        int id,
        int partId)
    {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var result = await _service.RemovePartAsync(
            id,
            partId,
            userId);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message = "Unable to remove part from work report."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Part removed successfully."
        });
    }
    
    
// OWNER / MANAGER THINGS

// Get all work reports
    [Authorize(Roles = "Owner,Manager")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var reports = await _service.GetAllAsync();

        return Ok(new
        {
            success = true,
            count = reports.Count,
            data = reports
        });
    }
    
    // Get work report by ID
    [Authorize(Roles = "Owner,Manager")]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var report = await _service.GetByIdAsync(id);

        if (report == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Work report not found."
            });
        }

        return Ok(new
        {
            success = true,
            data = report
        });
    }
    
    // Approve work report
    [Authorize(Roles = "Owner,Manager")]
    [HttpPatch("{id:int}/approve")]
    public async Task<IActionResult> Approve(int id)
    {
        var result =
            await _service.ApproveAsync(id);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message = "Unable to approve work report."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Work report approved successfully."
        });
    }
    
    // Request correction for work report
    [Authorize(Roles = "Owner,Manager")]
    [HttpPatch("{id:int}/correction")]
    public async Task<IActionResult> RequestCorrection(
        int id,
        [FromBody] RequestCorrectionDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result =
            await _service.RequestCorrectionAsync(
                id,
                dto.CorrectionReason);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message = "Unable to request correction."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Correction requested successfully."
        });
    }
    
    
    // Update work report
    [Authorize(Roles = "Technician")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateWorkReportDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var result =
            await _service.UpdateAsync(
                id,
                userId,
                dto);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message = "Unable to update work report."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Work report updated successfully."
        });
    }
    
    
    // Get work reports by review status
    [Authorize(Roles = "Owner,Manager")]
    [HttpGet("status/{status}")]
    public async Task<IActionResult> GetByStatus(string status)
    {
        var reports =
            await _service.GetByStatusAsync(status);

        return Ok(new
        {
            success = true,
            count = reports.Count,
            data = reports
        });
    }
    
    // Management dashboard
    [Authorize(Roles = "Owner,Manager")]
    [HttpGet("management-dashboard")]
    public async Task<IActionResult> GetManagementDashboard()
    {
        var dashboard =
            await _service.GetDashboardAsync();

        return Ok(new
        {
            success = true,
            data = dashboard
        });
    }
    
    
    
}