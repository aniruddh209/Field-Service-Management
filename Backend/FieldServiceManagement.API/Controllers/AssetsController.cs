using System.Security.Claims;
using FieldServiceManagement.API.DTOs.Assets;
using FieldServiceManagement.API.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldServiceManagement.API.Controllers;

[Authorize(Roles = "Customer")]
[ApiController]
[Route("api/[controller]")]
public class AssetsController : ControllerBase
{
    private readonly AssetService _service;
    private readonly IValidator<CreateAssetDto> _createValidator;
    private readonly IValidator<UpdateAssetDto> _updateValidator;

    public AssetsController(
        AssetService service,
        IValidator<CreateAssetDto> createValidator,
        IValidator<UpdateAssetDto> updateValidator)
    {
        _service = service;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

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

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateAssetDto dto)
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

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateAssetDto dto)
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

    private int? GetUserId()
    {
        var userIdValue =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var userId))
            return null;

        return userId;
    }
}