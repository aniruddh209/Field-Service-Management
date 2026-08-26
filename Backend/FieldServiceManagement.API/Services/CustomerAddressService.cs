using FieldServiceManagement.API.Data;
using FieldServiceManagement.API.DTOs.CustomerAddresses;
using FieldServiceManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FieldServiceManagement.API.Services;

public class CustomerAddressService
{
    private readonly AppDbContext _context;

    public CustomerAddressService(AppDbContext context)
    {
        _context = context;
    }

    // CREATE
    public async Task<CustomerAddress?> CreateAsync(
        int customerId,
        CreateCustomerAddressDto dto)
    {
        // Make sure the customer actually exists.
        var customerExists = await _context.Users
            .AnyAsync(u =>
                u.Id == customerId &&
                u.Role == "Customer");

        if (!customerExists)
            return null;

        var address = new CustomerAddress
        {
            CustomerId = customerId,

            AddressTitle = dto.AddressTitle.Trim(),
            AddressLine = dto.AddressLine.Trim(),
            Area = dto.Area.Trim(),
            City = dto.City.Trim(),
            State = dto.State.Trim(),
            Pincode = dto.Pincode.Trim(),
            Landmark = string.IsNullOrWhiteSpace(dto.Landmark)
                ? null
                : dto.Landmark.Trim()
        };

        _context.CustomerAddresses.Add(address);

        await _context.SaveChangesAsync();

        return address;
    }


    // GET MY ADDRESSES
    public async Task<List<CustomerAddress>> GetMyAddressesAsync(
        int customerId)
    {
        return await _context.CustomerAddresses
            .AsNoTracking()
            .Where(x => x.CustomerId == customerId)
            .OrderBy(x => x.Id)
            .ToListAsync();
    }


    // GET ONE ADDRESS
    public async Task<CustomerAddress?> GetByIdAsync(
        int customerId,
        int id)
    {
        return await _context.CustomerAddresses
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.CustomerId == customerId);
    }


    // UPDATE
    public async Task<CustomerAddress?> UpdateAsync(
        int customerId,
        int id,
        UpdateCustomerAddressDto dto)
    {
        var address = await _context.CustomerAddresses
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.CustomerId == customerId);

        if (address == null)
            return null;

        address.AddressTitle = dto.AddressTitle.Trim();

        address.AddressLine = dto.AddressLine.Trim();

        address.Area = dto.Area.Trim();

        address.City = dto.City.Trim();

        address.State = dto.State.Trim();

        address.Pincode = dto.Pincode.Trim();

        address.Landmark =
            string.IsNullOrWhiteSpace(dto.Landmark)
                ? null
                : dto.Landmark.Trim();

        await _context.SaveChangesAsync();

        return address;
    }


    // DELETE
    public async Task<bool> DeleteAsync(
        int customerId,
        int id)
    {
        var address = await _context.CustomerAddresses
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                x.CustomerId == customerId);

        if (address == null)
            return false;

        _context.CustomerAddresses.Remove(address);

        await _context.SaveChangesAsync();

        return true;
    }
}