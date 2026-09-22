using FieldServiceManagement.API.DTOs.ServiceRequests;
using FieldServiceManagement.API.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FieldServiceManagement.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ServiceRequestsController : ControllerBase
{
    private readonly ServiceRequestService _service;
    private readonly IValidator<CreateServiceRequestDto> _createValidator;
    private readonly IValidator<UpdateServiceRequestDto> _updateValidator;
    private readonly IValidator<AssignTechnicianDto> _assignTechnicianValidator;

    public ServiceRequestsController(
        ServiceRequestService service,
        IValidator<CreateServiceRequestDto> createValidator,
        IValidator<UpdateServiceRequestDto> updateValidator,
        IValidator<AssignTechnicianDto> assignTechnicianValidator)
    {
        _service = service;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _assignTechnicianValidator = assignTechnicianValidator;
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var requests = await _service.GetAllAsync();

        return Ok(new
        {
            success = true,
            count = requests.Count,
            data = requests
        });
    }

    [Authorize(Roles = "Owner,Manager,Customer,Technician")]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var request = await _service.GetByIdAsync(id);

        if (request == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Service request not found."
            });
        }

        return Ok(new
        {
            success = true,
            data = request
        });
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpGet("status/{status}")]
    public async Task<IActionResult> GetByStatus(string status)
    {
        var requests = await _service.GetByStatusAsync(status);

        return Ok(new
        {
            success = true,
            count = requests.Count,
            data = requests
        });
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpGet("search")]
    public async Task<IActionResult> Search(string name)
    {
        var requests = await _service.SearchAsync(name);

        if (requests.Count == 0)
        {
            return NotFound(new
            {
                success = false,
                message = "No service requests found."
            });
        }

        return Ok(new
        {
            success = true,
            count = requests.Count,
            data = requests
        });
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpPatch("{id:int}/assign")]
    public async Task<IActionResult> AssignTechnician(
        int id,
        AssignTechnicianDto dto)
    {
        var validationResult = await _assignTechnicianValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Validation failed.",
                errors = validationResult.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage })
            });
        }

        var result = await _service.AssignTechnicianAsync(id, dto);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message = "Unable to assign technician."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Technician assigned successfully."
        });
    }

    [Authorize(Roles = "Technician")]
    [HttpGet("technician/my")]
    public async Task<IActionResult> GetMyTechnicianRequests()
    {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var requests =
            await _service.GetTechnicianRequestsAsync(userId);

        return Ok(new
        {
            success = true,
            count = requests.Count,
            data = requests
        });
    }

    [Authorize(Roles = "Technician")]
    [HttpPatch("{id:int}/start")]
    public async Task<IActionResult> StartRequest(int id)
    {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var result =
            await _service.StartRequestAsync(
                id,
                userId);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message = "Unable to start request."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Service request started successfully."
        });
    }

    [Authorize(Roles = "Technician")]
    [HttpPatch("{id:int}/complete")]
    public async Task<IActionResult> CompleteRequest(int id)
    {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var result =
            await _service.CompleteRequestAsync(
                id,
                userId);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message = "Unable to complete request."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Service request completed successfully."
        });
    }

    [Authorize(Roles = "Customer")]
    [HttpGet("my")]
    public async Task<IActionResult> GetMyRequests()
    {
        var customerId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value
        );

        var requests =
            await _service.GetCustomerRequestsAsync(customerId);

        return Ok(new
        {
            success = true,
            count = requests.Count,
            data = requests
        });
    }

    [Authorize(Roles = "Customer")]
    [HttpGet("my/{id:int}")]
    public async Task<IActionResult> GetMyRequestById(int id)
    {
        var customerId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value
        );

        var request =
            await _service.GetCustomerRequestByIdAsync(
                id,
                customerId);

        if (request == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Service request not found."
            });
        }

        return Ok(new
        {
            success = true,
            data = request
        });
    }

    [Authorize(Roles = "Customer")]
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateServiceRequestDto dto)
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

        var customerId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value
        );

        var result =
            await _service.CreateAsync(
                customerId,
                dto);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid service selected."
            });
        }

        return StatusCode(201, new
        {
            success = true,
            message = "Service request created successfully."
        });
    }

    [Authorize(Roles = "Customer")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateServiceRequestDto dto)
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

        var customerId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value
        );

        var result =
            await _service.UpdateAsync(
                id,
                customerId,
                dto);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message = "Unable to update request."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Request updated successfully."
        });
    }

    [Authorize(Roles = "Customer")]
    [HttpPatch("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var customerId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value
        );

        var result =
            await _service.CancelAsync(
                id,
                customerId);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message = "Unable to cancel request."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Request cancelled successfully."
        });
    }

    [Authorize(Roles = "Customer")]
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var customerId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var dashboard =
            await _service.GetCustomerDashboardAsync(customerId);

        return Ok(new
        {
            success = true,
            data = dashboard
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