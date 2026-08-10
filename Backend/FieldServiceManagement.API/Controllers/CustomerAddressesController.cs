using System.Security.Claims;
using FieldServiceManagement.API.Data;
using FieldServiceManagement.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FieldServiceManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomerAddressesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CustomerAddressesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CustomerAddress address)
    {
        var customerId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        address.CustomerId = customerId;

        _context.CustomerAddresses.Add(address);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = "Address created successfully.",
            data = address
        });
    }
    
    [HttpGet("my")]
    public async Task<IActionResult> GetMyAddresses()
    {
        var customerId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var addresses = await _context.CustomerAddresses
            .Where(x => x.CustomerId == customerId)
            .ToListAsync();

        return Ok(new
        {
            success = true,
            count = addresses.Count,
            data = addresses
        });
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var customerId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var address = await _context.CustomerAddresses
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.CustomerId == customerId);

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
    
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        CustomerAddress address)
    {
        var customerId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var existingAddress = await _context.CustomerAddresses
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.CustomerId == customerId);

        if (existingAddress == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Address not found."
            });
        }

        existingAddress.AddressTitle = address.AddressTitle;
        existingAddress.AddressLine = address.AddressLine;
        existingAddress.Area = address.Area;
        existingAddress.City = address.City;
        existingAddress.State = address.State;
        existingAddress.Pincode = address.Pincode;
        existingAddress.Landmark = address.Landmark;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = "Address updated successfully.",
            data = existingAddress
        });
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var customerId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var address = await _context.CustomerAddresses
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.CustomerId == customerId);

        if (address == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Address not found."
            });
        }

        _context.CustomerAddresses.Remove(address);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = "Address deleted successfully."
        });
    }
}