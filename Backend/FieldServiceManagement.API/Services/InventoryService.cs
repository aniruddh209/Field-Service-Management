using System.Data;
using FieldServiceManagement.API.Data;
using FieldServiceManagement.API.DTOs.Inventory;
using FieldServiceManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FieldServiceManagement.API.Services;

public class InventoryService
{
    private readonly AppDbContext _context;
    private readonly NotificationService _notificationService;

    public InventoryService(
        AppDbContext context,
        NotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }


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


    public async Task<InventoryItemDto?> GetByIdAsync(int id)
    {
        var item = await _context.InventoryItems
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
            return null;

        return MapToDto(item);
    }


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

                CreatedAt = DateTime.UtcNow
            };


            _context.InventoryItems.Add(item);

            await _context.SaveChangesAsync();


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


            await NotifyManagersAsync(
                "New Inventory Item",
                $"Inventory item '{item.Name}' ({item.SKU}) was added to inventory.",
                "Inventory",
                item.Id);


            if (item.QuantityInStock <= item.ReorderLevel)
            {
                await NotifyManagersAsync(
                    "Low Stock Alert",
                    $"Inventory item '{item.Name}' ({item.SKU}) is at or below its reorder level. Current stock: {item.QuantityInStock}.",
                    "Inventory",
                    item.Id);
            }


            return true;
        }
        catch
        {
            await transaction.RollbackAsync();

            return false;
        }
    }


    public async Task<bool> UpdateAsync(
        int id,
        UpdateInventoryItemDto dto)
    {
        var item = await _context.InventoryItems
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
            return false;


        var sku = dto.SKU.Trim();


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


        await _context.SaveChangesAsync();

        return true;
    }


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


        await NotifyManagersAsync(
            "Inventory Item Deactivated",
            $"Inventory item '{item.Name}' ({item.SKU}) has been deactivated.",
            "Inventory",
            item.Id);


        return true;
    }


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


            if (dto.QuantityChange == 0)
                return false;


            var oldQuantity =
                item.QuantityInStock;


            var newQuantity =
                oldQuantity +
                dto.QuantityChange;


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


            var adjustmentType =
                dto.QuantityChange > 0
                    ? "increased"
                    : "decreased";

            await NotifyManagersAsync(
                "Inventory Stock Updated",
                $"Stock for '{item.Name}' ({item.SKU}) was {adjustmentType}. Current stock: {newQuantity}.",
                "Inventory",
                item.Id);


            var becameLowStock =
                newQuantity <= item.ReorderLevel &&
                oldQuantity > item.ReorderLevel;

            if (becameLowStock)
            {
                await NotifyManagersAsync(
                    "Low Stock Alert",
                    $"Inventory item '{item.Name}' ({item.SKU}) is now low on stock. Current stock: {newQuantity}. Reorder level: {item.ReorderLevel}.",
                    "Inventory",
                    item.Id);
            }


            return true;
        }
        catch
        {
            await transaction.RollbackAsync();

            return false;
        }
    }


    private async Task NotifyManagersAsync(
        string title,
        string message,
        string relatedEntityType,
        int relatedEntityId)
    {
        var users = await _context.Users
            .Where(u =>
                u.Role == "Owner" ||
                u.Role == "Manager")
            .Select(u => u.Id)
            .ToListAsync();


        foreach (var userId in users)
        {
            await _notificationService.CreateAsync(
                new DTOs.Notifications.CreateNotificationDto
                {
                    UserId = userId,

                    Title = title,

                    Message = message,

                    Type = "Inventory",

                    RelatedEntityType =
                        relatedEntityType,

                    RelatedEntityId =
                        relatedEntityId
                });
        }
    }


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