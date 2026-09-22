using FieldServiceManagement.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FieldServiceManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("wipe-database")]
    [HttpGet("wipe-database")]
    public async Task<IActionResult> WipeDatabase()
    {
        try
        {
            await _context.Database.ExecuteSqlRawAsync(@"
                DELETE FROM [InvoiceItems];
                DELETE FROM [Invoices];
                DELETE FROM [WorkReportParts];
                DELETE FROM [WorkReports];
                DELETE FROM [StockMovements];
                DELETE FROM [StatusHistories];
                DELETE FROM [Notifications];
                DELETE FROM [ServiceRequests];
                DELETE FROM [Assets];
                DELETE FROM [CustomerAddresses];
                DELETE FROM [Technicians];
                DELETE FROM [Services];
                DELETE FROM [InventoryItems];
                DELETE FROM [Users];
            ");

            return Ok(new
            {
                success = true,
                message = "Database successfully wiped. All user, service, request, invoice, asset, inventory, and notification records removed."
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Failed to wipe database.",
                error = ex.Message
            });
        }
    }
}
