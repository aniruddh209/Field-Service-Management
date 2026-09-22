using FieldServiceManagement.API.Data;
using FieldServiceManagement.API.DTOs.Assets;
using FieldServiceManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FieldServiceManagement.API.Services;

public class AssetService
{
    private readonly AppDbContext _context;

    public AssetService(AppDbContext context)
    {
        _context = context;
    }


    public async Task<List<AssetDto>> GetMyAssetsAsync(int userId)
    {
        var assets = await _context.Assets
            .Include(a => a.Customer)
            .Where(a => a.CustomerId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return assets
            .Select(MapToDto)
            .ToList();
    }


    public async Task<AssetDto?> GetByIdAsync(
        int assetId,
        int userId)
    {
        var asset = await _context.Assets
            .Include(a => a.Customer)
            .FirstOrDefaultAsync(a =>
                a.Id == assetId &&
                a.CustomerId == userId);

        if (asset == null)
            return null;

        return MapToDto(asset);
    }


    public async Task<bool> CreateAsync(
        int userId,
        CreateAssetDto dto)
    {
        var customer = await _context.Users
            .FirstOrDefaultAsync(u =>
                u.Id == userId &&
                u.IsActive &&
                u.Role == "Customer");

        if (customer == null)
            return false;

        var asset = new Asset
        {
            CustomerId = userId,

            Name = dto.Name.Trim(),

            Brand = string.IsNullOrWhiteSpace(dto.Brand)
                ? null
                : dto.Brand.Trim(),

            Model = string.IsNullOrWhiteSpace(dto.Model)
                ? null
                : dto.Model.Trim(),

            SerialNumber = string.IsNullOrWhiteSpace(dto.SerialNumber)
                ? null
                : dto.SerialNumber.Trim(),

            Description = string.IsNullOrWhiteSpace(dto.Description)
                ? null
                : dto.Description.Trim(),

            CreatedAt = DateTime.UtcNow
        };

        _context.Assets.Add(asset);

        await _context.SaveChangesAsync();

        return true;
    }


    public async Task<bool> UpdateAsync(
        int assetId,
        int userId,
        UpdateAssetDto dto)
    {
        var asset = await _context.Assets
            .FirstOrDefaultAsync(a =>
                a.Id == assetId &&
                a.CustomerId == userId);

        if (asset == null)
            return false;

        asset.Name = dto.Name.Trim();

        asset.Brand = string.IsNullOrWhiteSpace(dto.Brand)
            ? null
            : dto.Brand.Trim();

        asset.Model = string.IsNullOrWhiteSpace(dto.Model)
            ? null
            : dto.Model.Trim();

        asset.SerialNumber = string.IsNullOrWhiteSpace(dto.SerialNumber)
            ? null
            : dto.SerialNumber.Trim();

        asset.Description = string.IsNullOrWhiteSpace(dto.Description)
            ? null
            : dto.Description.Trim();

        asset.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }


    public async Task<bool> DeleteAsync(
        int assetId,
        int userId)
    {
        var asset = await _context.Assets
            .FirstOrDefaultAsync(a =>
                a.Id == assetId &&
                a.CustomerId == userId);

        if (asset == null)
            return false;

        var hasServiceRequests = await _context.ServiceRequests
            .AnyAsync(sr =>
                sr.AssetId == assetId);

        if (hasServiceRequests)
            return false;

        _context.Assets.Remove(asset);

        await _context.SaveChangesAsync();

        return true;
    }


    private static AssetDto MapToDto(Asset asset)
    {
        return new AssetDto
        {
            Id = asset.Id,

            CustomerId = asset.CustomerId,

            CustomerName = asset.Customer.FullName,

            Name = asset.Name,

            Brand = asset.Brand,

            Model = asset.Model,

            SerialNumber = asset.SerialNumber,

            Description = asset.Description,

            CreatedAt = asset.CreatedAt,

            UpdatedAt = asset.UpdatedAt
        };
    }
}