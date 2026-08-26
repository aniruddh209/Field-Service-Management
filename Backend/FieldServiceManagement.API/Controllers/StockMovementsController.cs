using FieldServiceManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldServiceManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Manager,Owner")]
public class StockMovementsController : ControllerBase
{
    private readonly StockMovementService _service;

    public StockMovementsController(
        StockMovementService service)
    {
        _service = service;
    }

    [HttpGet("inventory/{inventoryItemId:int}")]
    public async Task<IActionResult> GetByInventoryItem(
        int inventoryItemId)
    {
        var movements =
            await _service.GetByInventoryItemAsync(
                inventoryItemId);

        return Ok(new
        {
            success = true,
            data = movements
        });
    }
}