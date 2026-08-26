using System.Security.Claims;

using FieldServiceManagement.API.DTOs.CustomerAddresses;
using FieldServiceManagement.API.Services;

using FluentValidation;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldServiceManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Customer")]
public class CustomerAddressesController : ControllerBase
{
    private readonly CustomerAddressService _addressService;

    private readonly IValidator<CreateCustomerAddressDto>
        _createValidator;

    private readonly IValidator<UpdateCustomerAddressDto>
        _updateValidator;


    public CustomerAddressesController(
        CustomerAddressService addressService,
        IValidator<CreateCustomerAddressDto> createValidator,
        IValidator<UpdateCustomerAddressDto> updateValidator)
    {
        _addressService = addressService;

        _createValidator = createValidator;

        _updateValidator = updateValidator;
    }


    // CREATE ADDRESS
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateCustomerAddressDto dto)
    {
        var customerId = GetCurrentUserId();

        if (customerId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user identity."
            });
        }


        var validationResult =
            await _createValidator.ValidateAsync(dto);

        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Validation failed.",
                errors = validationResult.Errors
                    .Select(error => new
                    {
                        field = error.PropertyName,
                        message = error.ErrorMessage
                    })
            });
        }


        var address =
            await _addressService.CreateAsync(
                customerId.Value,
                dto);


        if (address == null)
        {
            return BadRequest(new
            {
                success = false,
                message = "Customer not found."
            });
        }


        return StatusCode(201, new
        {
            success = true,
            message = "Address created successfully.",
            data = address
        });
    }


    // GET MY ADDRESSES
    [HttpGet("my")]
    public async Task<IActionResult> GetMyAddresses()
    {
        var customerId = GetCurrentUserId();

        if (customerId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user identity."
            });
        }


        var addresses =
            await _addressService
                .GetMyAddressesAsync(customerId.Value);


        return Ok(new
        {
            success = true,
            count = addresses.Count,
            data = addresses
        });
    }


    // GET ONE ADDRESS
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        if (id <= 0)
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid address ID."
            });
        }


        var customerId = GetCurrentUserId();

        if (customerId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user identity."
            });
        }


        var address =
            await _addressService
                .GetByIdAsync(
                    customerId.Value,
                    id);


        if (address == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Address not found."
            });
        }


        return Ok(new
        {
            success = true,
            data = address
        });
    }


    // UPDATE ADDRESS
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateCustomerAddressDto dto)
    {
        if (id <= 0)
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid address ID."
            });
        }


        var customerId = GetCurrentUserId();

        if (customerId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user identity."
            });
        }


        var validationResult =
            await _updateValidator.ValidateAsync(dto);

        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Validation failed.",
                errors = validationResult.Errors
                    .Select(error => new
                    {
                        field = error.PropertyName,
                        message = error.ErrorMessage
                    })
            });
        }


        var address =
            await _addressService.UpdateAsync(
                customerId.Value,
                id,
                dto);


        if (address == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Address not found."
            });
        }


        return Ok(new
        {
            success = true,
            message = "Address updated successfully.",
            data = address
        });
    }


    // DELETE ADDRESS
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (id <= 0)
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid address ID."
            });
        }


        var customerId = GetCurrentUserId();

        if (customerId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user identity."
            });
        }


        var result =
            await _addressService.DeleteAsync(
                customerId.Value,
                id);


        if (!result)
        {
            return NotFound(new
            {
                success = false,
                message = "Address not found."
            });
        }


        return Ok(new
        {
            success = true,
            message = "Address deleted successfully."
        });
    }


    // GET CURRENT USER ID FROM JWT
    private int? GetCurrentUserId()
    {
        var claim =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);


        if (!int.TryParse(
                claim,
                out var userId))
        {
            return null;
        }


        return userId;
    }
}