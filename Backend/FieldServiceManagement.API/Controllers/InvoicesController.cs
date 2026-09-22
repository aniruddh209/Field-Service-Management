using System.Security.Claims;
using FieldServiceManagement.API.DTOs.Invoices;
using FieldServiceManagement.API.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldServiceManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoicesController : ControllerBase
{
    private readonly InvoiceService _invoiceService;
    private readonly IValidator<CreateInvoiceDto> _createValidator;

    public InvoicesController(
        InvoiceService invoiceService,
        IValidator<CreateInvoiceDto> createValidator)
    {
        _invoiceService = invoiceService;
        _createValidator = createValidator;
    }

    [Authorize(Roles = "Manager,Owner")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var invoices =
            await _invoiceService.GetAllAsync();

        return Ok(new
        {
            success = true,
            count = invoices.Count,
            data = invoices
        });
    }

    [Authorize(Roles = "Manager,Owner")]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(
        int id)
    {
        var invoice =
            await _invoiceService.GetByIdAsync(id);

        if (invoice == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Invoice not found."
            });
        }

        return Ok(new
        {
            success = true,
            data = invoice
        });
    }

    [Authorize(Roles = "Manager,Owner")]
    [HttpPost("generate")]
    public async Task<IActionResult> Generate(
        [FromBody] CreateInvoiceDto dto)
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

        var userIdClaim =
            User.FindFirst(
                ClaimTypes.NameIdentifier);

        if (userIdClaim == null ||
            !int.TryParse(
                userIdClaim.Value,
                out var userId))
        {
            return Unauthorized(new
            {
                success = false,
                message = "User identity not found."
            });
        }

        var exists =
            await _invoiceService
                .ExistsForServiceRequestAsync(
                    dto.ServiceRequestId);

        if (exists)
        {
            return Conflict(new
            {
                success = false,
                message =
                    "An invoice already exists for this service request."
            });
        }

        var invoice =
            await _invoiceService.GenerateAsync(
                userId,
                dto);

        if (invoice == null)
        {
            return BadRequest(new
            {
                success = false,
                message =
                    "Invoice could not be generated. Make sure the service request has an approved work report."
            });
        }

        return StatusCode(
            StatusCodes.Status201Created,
            new
            {
                success = true,
                message = "Invoice generated successfully.",
                data = invoice
            });
    }

    [Authorize(Roles = "Customer")]
    [HttpGet("my")]
    public async Task<IActionResult> GetMyInvoices()
    {
        var userIdClaim =
            User.FindFirst(
                ClaimTypes.NameIdentifier);

        if (userIdClaim == null ||
            !int.TryParse(
                userIdClaim.Value,
                out var userId))
        {
            return Unauthorized(new
            {
                success = false,
                message = "User identity not found."
            });
        }

        var invoices =
            await _invoiceService
                .GetMyInvoicesAsync(userId);

        return Ok(new
        {
            success = true,
            count = invoices.Count,
            data = invoices
        });
    }

    [Authorize(Roles = "Manager,Owner")]
    [HttpGet("customer/{customerId:int}")]
    public async Task<IActionResult> GetByCustomer(
        int customerId)
    {
        var invoices =
            await _invoiceService
                .GetByCustomerAsync(customerId);

        return Ok(new
        {
            success = true,
            count = invoices.Count,
            data = invoices
        });
    }

    [Authorize(Roles = "Manager,Owner")]
    [HttpGet("status/{status}")]
    public async Task<IActionResult> GetByStatus(
        string status)
    {
        var invoices =
            await _invoiceService
                .GetByStatusAsync(status);

        return Ok(new
        {
            success = true,
            count = invoices.Count,
            data = invoices
        });
    }

    [Authorize(Roles = "Manager,Owner")]
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(
        int id,
        [FromBody] string status)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return BadRequest(new
            {
                success = false,
                message = "Status is required."
            });
        }

        var updated =
            await _invoiceService
                .UpdateStatusAsync(
                    id,
                    status);

        if (!updated)
        {
            return BadRequest(new
            {
                success = false,
                message =
                    "Invoice not found or invalid status."
            });
        }

        var invoice =
            await _invoiceService
                .GetByIdAsync(id);

        return Ok(new
        {
            success = true,
            message = "Invoice status updated successfully.",
            data = invoice
        });
    }

    [Authorize(Roles = "Manager,Owner")]
    [HttpGet("exists/service-request/{serviceRequestId:int}")]
    public async Task<IActionResult> ExistsForServiceRequest(
        int serviceRequestId)
    {
        var exists =
            await _invoiceService
                .ExistsForServiceRequestAsync(
                    serviceRequestId);

        return Ok(new
        {
            success = true,
            exists
        });
    }

    [Authorize(Roles = "Manager,Owner,Admin")]
    [HttpGet("request/{serviceRequestId:int}")]
    public async Task<IActionResult> GetByServiceRequestId(int serviceRequestId)
    {
        var invoice = await _invoiceService.GetByServiceRequestIdAsync(serviceRequestId);

        if (invoice == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Invoice not found for this service request."
            });
        }

        return Ok(new
        {
            success = true,
            data = invoice
        });
    }

    [Authorize(Roles = "Manager,Owner")]
    [HttpGet("exists/work-report/{workReportId:int}")]
    public async Task<IActionResult> ExistsForWorkReport(
        int workReportId)
    {
        var exists =
            await _invoiceService
                .ExistsForWorkReportAsync(
                    workReportId);

        return Ok(new
        {
            success = true,
            exists
        });
    }
}