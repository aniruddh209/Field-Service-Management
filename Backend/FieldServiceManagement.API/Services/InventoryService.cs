using System.Data;
using FieldServiceManagement.API.Data;
using FieldServiceManagement.API.DTOs.Inventory;
using FieldServiceManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FieldServiceManagement.API.Services;

public class InventoryService
{
    private readonly AppDbContext _context;

    public InventoryService(AppDbContext context)
    {
        _context = context;
    }


    // =========================================================
    // GET ALL INVENTORY ITEMS
    // =========================================================

    public async Task<List<InventoryItemDto>> GetAllAsync()
    {
        var items = await _context.InventoryItems
            .AsNoTracking()
            .OrderBy(i => i.Name)
            .ToListAsync();

        return items
            .Select(MapToDto)
            .ToList();
    }


    // =========================================================
    // GET INVENTORY ITEM BY ID
    // =========================================================

    public async Task<InventoryItemDto?> GetByIdAsync(int id)
    {
        var item = await _context.InventoryItems
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
            return null;

        return MapToDto(item);
    }


    // =========================================================
    // CREATE INVENTORY ITEM
    // =========================================================

    public async Task<bool> CreateAsync(
        int userId,
        CreateInventoryItemDto dto)
    {
        await using var transaction =
            await _context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        try
        {
            var sku = dto.SKU.Trim();

            // SKU must be unique
            var existingItem = await _context.InventoryItems
                .AnyAsync(i => i.SKU == sku);

            if (existingItem)
                return false;


            var item = new InventoryItem
            {
                SKU = sku,

                Name = dto.Name.Trim(),

                Category =
                    string.IsNullOrWhiteSpace(dto.Category)
                        ? null
                        : dto.Category.Trim(),

                QuantityInStock =
                    dto.QuantityInStock,

                ReorderLevel =
                    dto.ReorderLevel,

                UnitPrice =
                    dto.UnitPrice,

                IsActive = true,

                CreatedAt =
                    DateTime.UtcNow
            };


            _context.InventoryItems.Add(item);

            await _context.SaveChangesAsync();


            // Record initial stock in history
            if (item.QuantityInStock > 0)
            {
                var movement = new StockMovement
                {
                    InventoryItemId =
                        item.Id,

                    QuantityChange =
                        item.QuantityInStock,

                    QuantityAfterChange =
                        item.QuantityInStock,

                    Reason =
                        "Initial stock",

                    UserId =
                        userId,

                    CreatedAt =
                        DateTime.UtcNow
                };

                _context.StockMovements.Add(movement);

                await _context.SaveChangesAsync();
            }


            await transaction.CommitAsync();

            return true;
        }
        catch
        {
            await transaction.RollbackAsync();

            return false;
        }
    }


    // =========================================================
    // UPDATE INVENTORY ITEM
    // =========================================================

    public async Task<bool> UpdateAsync(
        int id,
        UpdateInventoryItemDto dto)
    {
        var item = await _context.InventoryItems
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
            return false;


        var sku = dto.SKU.Trim();


        // Check duplicate SKU
        var duplicateSku = await _context.InventoryItems
            .AnyAsync(i =>
                i.SKU == sku &&
                i.Id != id);

        if (duplicateSku)
            return false;


        item.SKU =
            sku;

        item.Name =
            dto.Name.Trim();

        item.Category =
            string.IsNullOrWhiteSpace(dto.Category)
                ? null
                : dto.Category.Trim();

        item.ReorderLevel =
            dto.ReorderLevel;

        item.UnitPrice =
            dto.UnitPrice;

        item.UpdatedAt =
            DateTime.UtcNow;


        // IMPORTANT:
        // QuantityInStock is intentionally NOT changed here.

        await _context.SaveChangesAsync();

        return true;
    }


    // =========================================================
    // DEACTIVATE INVENTORY ITEM
    // =========================================================

    public async Task<bool> DeactivateAsync(int id)
    {
        var item = await _context.InventoryItems
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
            return false;


        if (!item.IsActive)
            return false;


        item.IsActive = false;

        item.UpdatedAt =
            DateTime.UtcNow;


        await _context.SaveChangesAsync();

        return true;
    }


    // =========================================================
    // SEARCH INVENTORY
    // =========================================================

    public async Task<List<InventoryItemDto>> SearchAsync(
        string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return new List<InventoryItemDto>();


        var search = name.Trim();


        var items = await _context.InventoryItems
            .AsNoTracking()
            .Where(i =>
                i.Name.Contains(search) ||
                i.SKU.Contains(search))
            .OrderBy(i => i.Name)
            .ToListAsync();


        return items
            .Select(MapToDto)
            .ToList();
    }


    // =========================================================
    // GET LOW-STOCK ITEMS
    // =========================================================

    public async Task<List<InventoryItemDto>> GetLowStockAsync()
    {
        var items = await _context.InventoryItems
            .AsNoTracking()
            .Where(i =>
                i.IsActive &&
                i.QuantityInStock <= i.ReorderLevel)
            .OrderBy(i => i.QuantityInStock)
            .ToListAsync();


        return items
            .Select(MapToDto)
            .ToList();
    }


    // =========================================================
    // ADJUST STOCK
    // =========================================================

    public async Task<bool> AdjustStockAsync(
        int inventoryItemId,
        int userId,
        AdjustStockDto dto)
    {
        await using var transaction =
            await _context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        try
        {
            var item = await _context.InventoryItems
                .FirstOrDefaultAsync(i =>
                    i.Id == inventoryItemId &&
                    i.IsActive);

            if (item == null)
                return false;


            // A stock adjustment of zero does nothing
            if (dto.QuantityChange == 0)
                return false;


            var newQuantity =
                item.QuantityInStock +
                dto.QuantityChange;


            // Stock can never become negative
            if (newQuantity < 0)
                return false;


            item.QuantityInStock =
                newQuantity;

            item.UpdatedAt =
                DateTime.UtcNow;


            var movement = new StockMovement
            {
                InventoryItemId =
                    item.Id,

                QuantityChange =
                    dto.QuantityChange,

                QuantityAfterChange =
                    newQuantity,

                Reason =
                    string.IsNullOrWhiteSpace(dto.Reason)
                        ? "Manual stock adjustment"
                        : dto.Reason.Trim(),

                UserId =
                    userId,

                CreatedAt =
                    DateTime.UtcNow
            };


            _context.StockMovements.Add(movement);


            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return true;
        }
        catch
        {
            await transaction.RollbackAsync();

            return false;
        }
    }


    // =========================================================
    // MAPPING
    // =========================================================

    private static InventoryItemDto MapToDto(
        InventoryItem item)
    {
        return new InventoryItemDto
        {
            Id =
                item.Id,

            SKU =
                item.SKU,

            Name =
                item.Name,

            Category =
                item.Category,

            QuantityInStock =
                item.QuantityInStock,

            ReorderLevel =
                item.ReorderLevel,

            UnitPrice =
                item.UnitPrice,

            IsActive =
                item.IsActive,

            IsLowStock =
                item.QuantityInStock <=
                item.ReorderLevel,

            CreatedAt =
                item.CreatedAt,

            UpdatedAt =
                item.UpdatedAt
        };
    }
}