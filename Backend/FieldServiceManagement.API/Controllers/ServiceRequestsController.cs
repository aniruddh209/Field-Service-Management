using FieldServiceManagement.API.DTOs.ServiceRequests;
using FieldServiceManagement.API.Services;
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

    public ServiceRequestsController(ServiceRequestService service)
    {
        _service = service;
    }

    
    // OWNER / MANAGER THINGS


    // Get all service requests
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


    // Get service request by ID
    [Authorize(Roles = "Owner,Manager")]
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


    // Get service requests by status
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


    // Search service requests
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


    // Assign technician
    [Authorize(Roles = "Owner,Manager")]
    [HttpPatch("{id:int}/assign")]
    public async Task<IActionResult> AssignTechnician(
        int id,
        AssignTechnicianDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

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


    
    // TECHNICIAN THINGS

    // Get all assigned jobs
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


    // Start job
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


    // Complete job
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


    
    // CUSTOMER THINGS

    // Get customer's own requests
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


    // Get customer's own request by ID
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


    // Create service request
    [Authorize(Roles = "Customer")]
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateServiceRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

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


    // Update service request
    [Authorize(Roles = "Customer")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateServiceRequestDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

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


    // Cancel service request
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


    
    // DASHBOARDS

    // Customer dashboard
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


    // Owner / Manager dashboard
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