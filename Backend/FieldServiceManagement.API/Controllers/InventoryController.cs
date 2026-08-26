using FieldServiceManagement.API.DTOs.Inventory;
using FieldServiceManagement.API.Services;
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

    public InventoryController(InventoryService service)
    {
        _service = service;
    }


    // =========================================================
    // GET ALL INVENTORY ITEMS
    // =========================================================

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


    // =========================================================
    // GET INVENTORY ITEM BY ID
    // =========================================================

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


    // =========================================================
    // SEARCH INVENTORY
    // =========================================================

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


    // =========================================================
    // GET LOW-STOCK ITEMS
    // =========================================================

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


    // =========================================================
    // CREATE INVENTORY ITEM
    // =========================================================

    [Authorize(Roles = "Owner,Manager")]
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateInventoryItemDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);


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


    // =========================================================
    // UPDATE INVENTORY ITEM DETAILS
    // =========================================================

    [Authorize(Roles = "Owner,Manager")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateInventoryItemDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);


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


    // =========================================================
    // ADJUST STOCK
    // =========================================================

    [Authorize(Roles = "Owner,Manager")]
    [HttpPatch("{id:int}/stock")]
    public async Task<IActionResult> AdjustStock(
        int id,
        [FromBody] AdjustStockDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);


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


    // =========================================================
    // DEACTIVATE INVENTORY ITEM
    // =========================================================

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