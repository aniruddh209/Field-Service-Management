using System.Security.Claims;
using FieldServiceManagement.API.DTOs.Assets;
using FieldServiceManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldServiceManagement.API.Controllers;

[Authorize(Roles = "Customer")]
[ApiController]
[Route("api/[controller]")]
public class AssetsController : ControllerBase
{
    private readonly AssetService _service;

    public AssetsController(AssetService service)
    {
        _service = service;
    }

    // GET: api/assets
    // Get all assets belonging to the logged-in customer
    [HttpGet]
    public async Task<IActionResult> GetMyAssets()
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "User identity could not be determined."
            });
        }

        var assets = await _service.GetMyAssetsAsync(userId.Value);

        return Ok(new
        {
            success = true,
            count = assets.Count,
            data = assets
        });
    }

    // GET: api/assets/{id}
    // Get one asset belonging to the logged-in customer
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "User identity could not be determined."
            });
        }

        var asset = await _service.GetByIdAsync(
            id,
            userId.Value);

        if (asset == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Asset not found."
            });
        }

        return Ok(new
        {
            success = true,
            data = asset
        });
    }

    // POST: api/assets
    // Create an asset for the logged-in customer
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateAssetDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid asset data.",
                errors = ModelState
            });
        }

        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "User identity could not be determined."
            });
        }

        var result = await _service.CreateAsync(
            userId.Value,
            dto);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message = "Unable to create asset."
            });
        }

        return StatusCode(201, new
        {
            success = true,
            message = "Asset created successfully."
        });
    }

    // PUT: api/assets/{id}
    // Update an asset belonging to the logged-in customer
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateAssetDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid asset data.",
                errors = ModelState
            });
        }

        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "User identity could not be determined."
            });
        }

        var result = await _service.UpdateAsync(
            id,
            userId.Value,
            dto);

        if (!result)
        {
            return NotFound(new
            {
                success = false,
                message = "Asset not found or does not belong to you."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Asset updated successfully."
        });
    }

    // DELETE: api/assets/{id}
    // Delete an asset that has not been used by a service request
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "User identity could not be determined."
            });
        }

        var result = await _service.DeleteAsync(
            id,
            userId.Value);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message = "Unable to delete asset. It may not exist, may not belong to you, or may already be used by a service request."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Asset deleted successfully."
        });
    }

    // Get logged-in user's ID from JWT
    private int? GetUserId()
    {
        var userIdValue =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var userId))
            return null;

        return userId;
    }
}