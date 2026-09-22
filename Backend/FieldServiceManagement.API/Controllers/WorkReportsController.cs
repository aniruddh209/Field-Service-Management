using FieldServiceManagement.API.DTOs.WorkReports;
using FieldServiceManagement.API.Services;
using FluentValidation;
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
    private readonly IValidator<CreateWorkReportDto> _createValidator;
    private readonly IValidator<UpdateWorkReportDto> _updateValidator;
    private readonly IValidator<AddWorkReportPartDto> _addPartValidator;
    private readonly IValidator<RequestCorrectionDto> _requestCorrectionValidator;

    public WorkReportsController(
        WorkReportService service,
        IValidator<CreateWorkReportDto> createValidator,
        IValidator<UpdateWorkReportDto> updateValidator,
        IValidator<AddWorkReportPartDto> addPartValidator,
        IValidator<RequestCorrectionDto> requestCorrectionValidator)
    {
        _service = service;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _addPartValidator = addPartValidator;
        _requestCorrectionValidator = requestCorrectionValidator;
    }

    [Authorize(Roles = "Technician")]
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateWorkReportDto dto)
    {
        var validationResult = await _createValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Validation failed.",
                errors = validationResult.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage })
            });
        }

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

    [Authorize(Roles = "Technician")]
    [HttpPost("{id:int}/parts")]
    public async Task<IActionResult> AddPart(
        int id,
        [FromBody] AddWorkReportPartDto dto)
    {
        var validationResult = await _addPartValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Validation failed.",
                errors = validationResult.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage })
            });
        }

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

    [Authorize(Roles = "Owner,Manager,Admin")]
    [HttpGet("service-request/{serviceRequestId:int}")]
    public async Task<IActionResult> GetByServiceRequestId(int serviceRequestId)
    {
        var report = await _service.GetByServiceRequestIdAsync(serviceRequestId);

        if (report == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Work report not found for this service request."
            });
        }

        return Ok(new
        {
            success = true,
            data = report
        });
    }

    [Authorize(Roles = "Owner,Manager,Admin")]
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

    [Authorize(Roles = "Owner,Manager,Admin")]
    [HttpPatch("{id:int}/correction")]
    [HttpPost("{id:int}/request-correction")]
    public async Task<IActionResult> RequestCorrection(
        int id,
        [FromBody] RequestCorrectionDto dto)
    {
        var validationResult = await _requestCorrectionValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Validation failed.",
                errors = validationResult.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage })
            });
        }

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

    [Authorize(Roles = "Technician")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateWorkReportDto dto)
    {
        var validationResult = await _updateValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Validation failed.",
                errors = validationResult.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage })
            });
        }

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