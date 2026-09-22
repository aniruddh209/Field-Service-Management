using System.Security.Claims;
using FieldServiceManagement.API.DTOs.Notifications;
using FieldServiceManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldServiceManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly NotificationService _notificationService;

    public NotificationsController(
        NotificationService notificationService)
    {
        _notificationService = notificationService;
    }


    [HttpGet("my")]
    public async Task<IActionResult> GetMyNotifications()
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user identity."
            });
        }

        var notifications =
            await _notificationService
                .GetMyNotificationsAsync(userId.Value);

        return Ok(new
        {
            success = true,
            count = notifications.Count,
            data = notifications
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
                message = "Invalid user identity."
            });
        }

        if (id <= 0)
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid notification ID."
            });
        }

        var notification =
            await _notificationService
                .GetByIdAsync(userId.Value, id);

        if (notification == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Notification not found."
            });
        }

        return Ok(new
        {
            success = true,
            data = notification
        });
    }


    [HttpGet("count")]
    public async Task<IActionResult> GetCount()
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user identity."
            });
        }

        var count =
            await _notificationService
                .GetCountAsync(userId.Value);

        return Ok(new
        {
            success = true,
            data = count
        });
    }


    [HttpPatch("{id:int}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user identity."
            });
        }

        if (id <= 0)
        {
            return BadRequest(new
            {
                success = false,
                message = "Invalid notification ID."
            });
        }

        var result =
            await _notificationService
                .MarkAsReadAsync(userId.Value, id);

        if (!result)
        {
            return NotFound(new
            {
                success = false,
                message = "Notification not found."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Notification marked as read."
        });
    }


    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid user identity."
            });
        }

        var count =
            await _notificationService
                .MarkAllAsReadAsync(userId.Value);

        return Ok(new
        {
            success = true,
            message = "All notifications marked as read.",
            count
        });
    }


    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteNotification(int id)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized(new { success = false, message = "Invalid user identity." });
        }

        var result = await _notificationService.DeleteAsync(userId.Value, id);
        if (!result)
        {
            return NotFound(new { success = false, message = "Notification not found." });
        }

        return Ok(new { success = true, message = "Notification deleted successfully." });
    }


    [HttpDelete("clear-all")]
    public async Task<IActionResult> ClearAllNotifications()
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized(new { success = false, message = "Invalid user identity." });
        }

        var count = await _notificationService.ClearAllAsync(userId.Value);
        return Ok(new { success = true, message = "All notifications cleared.", count });
    }


    private int? GetUserId()
    {
        var claim =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (int.TryParse(claim, out var userId))
        {
            return userId;
        }

        return null;
    }
}