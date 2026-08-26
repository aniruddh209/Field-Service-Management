using FieldServiceManagement.API.Data;
using FieldServiceManagement.API.DTOs.Inventory;
using Microsoft.EntityFrameworkCore;

namespace FieldServiceManagement.API.Services;

public class StockMovementService
{
    private readonly AppDbContext _context;

    public StockMovementService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<StockMovementDto>> GetByInventoryItemAsync(
        int inventoryItemId)
    {
        var movements = await _context.StockMovements
            .AsNoTracking()
            .Include(m => m.InventoryItem)
            .Include(m => m.User)
            .Where(m => m.InventoryItemId == inventoryItemId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();

        return movements
            .Select(m => new StockMovementDto
            {
                Id = m.Id,

                InventoryItemId =
                    m.InventoryItemId,

                SKU =
                    m.InventoryItem.SKU,

                ItemName =
                    m.InventoryItem.Name,

                QuantityChange =
                    m.QuantityChange,

                QuantityAfterChange =
                    m.QuantityAfterChange,

                Reason =
                    m.Reason,

                UserId =
                    m.UserId,

                UserName =
                    m.User != null
                        ? m.User.FullName
                        : null,

                CreatedAt =
                    m.CreatedAt
            })
            .ToList();
    }
}