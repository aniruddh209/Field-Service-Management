using FieldServiceManagement.API.DTOs.Inventory;
using FieldServiceManagement.API.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FieldServiceManagement.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly InventoryService _service;
    private readonly IValidator<CreateInventoryItemDto> _createValidator;
    private readonly IValidator<UpdateInventoryItemDto> _updateValidator;
    private readonly IValidator<AdjustStockDto> _adjustStockValidator;

    public InventoryController(
        InventoryService service,
        IValidator<CreateInventoryItemDto> createValidator,
        IValidator<UpdateInventoryItemDto> updateValidator,
        IValidator<AdjustStockDto> adjustStockValidator)
    {
        _service = service;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _adjustStockValidator = adjustStockValidator;
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _service.GetAllAsync();

        return Ok(new
        {
            success = true,
            count = items.Count,
            data = items
        });
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);

        if (item == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Inventory item not found."
            });
        }

        return Ok(new
        {
            success = true,
            data = item
        });
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpGet("search")]
    public async Task<IActionResult> Search(
        [FromQuery] string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new
            {
                success = false,
                message = "Search term is required."
            });
        }

        var items = await _service.SearchAsync(name);

        return Ok(new
        {
            success = true,
            count = items.Count,
            data = items
        });
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock()
    {
        var items = await _service.GetLowStockAsync();

        return Ok(new
        {
            success = true,
            count = items.Count,
            data = items
        });
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateInventoryItemDto dto)
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
            User.FindFirstValue(
                ClaimTypes.NameIdentifier)!
        );

        var result = await _service.CreateAsync(
            userId,
            dto);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message =
                    "Unable to create inventory item. " +
                    "SKU may already exist."
            });
        }

        return StatusCode(201, new
        {
            success = true,
            message =
                "Inventory item created successfully."
        });
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateInventoryItemDto dto)
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

        var result =
            await _service.UpdateAsync(
                id,
                dto);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message =
                    "Unable to update inventory item."
            });
        }

        return Ok(new
        {
            success = true,
            message =
                "Inventory item updated successfully."
        });
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpPatch("{id:int}/stock")]
    public async Task<IActionResult> AdjustStock(
        int id,
        [FromBody] AdjustStockDto dto)
    {
        var validationResult = await _adjustStockValidator.ValidateAsync(dto);
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
            User.FindFirstValue(
                ClaimTypes.NameIdentifier)!
        );

        var result =
            await _service.AdjustStockAsync(
                id,
                userId,
                dto);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message =
                    "Unable to adjust stock. " +
                    "Item may not exist, be inactive, " +
                    "or stock cannot become negative."
            });
        }

        return Ok(new
        {
            success = true,
            message =
                "Stock adjusted successfully."
        });
    }

    [Authorize(Roles = "Owner,Manager")]
    [HttpPatch("{id:int}/deactivate")]
    public async Task<IActionResult> Deactivate(
        int id)
    {
        var result =
            await _service.DeactivateAsync(id);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message =
                    "Unable to deactivate inventory item."
            });
        }

        return Ok(new
        {
            success = true,
            message =
                "Inventory item deactivated successfully."
        });
    }
}