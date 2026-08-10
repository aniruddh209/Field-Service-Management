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
    

    [Authorize(Roles = "Customer")]
    [HttpGet("my")]
    public async Task<IActionResult> GetMyRequests()
    {
        var customerId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

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
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var customerId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

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
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var customerId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var result =
            await _service.CreateAsync(customerId, dto);

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
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var customerId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

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
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

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
}