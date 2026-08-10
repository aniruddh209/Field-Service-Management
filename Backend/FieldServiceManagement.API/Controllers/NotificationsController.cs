using FieldServiceManagement.API.Data;
using FieldServiceManagement.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace FieldServiceManagement.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public NotificationsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetAllNotifications()
    {
        return Ok(_context.Notifications.ToList());
    }

    [HttpGet("{id}")]
    public IActionResult GetNotificationById(int id)
    {
        var notification = _context.Notifications.Find(id);

        if (notification == null)
            return NotFound("Notification Not Found");

        return Ok(notification);
    }

    [HttpPost]
    public IActionResult InsertNotification(Notification notification)
    {
        _context.Notifications.Add(notification);
        _context.SaveChanges();

        return Ok("Notification Added Successfully");
    }

    [HttpPut("{id}")]
    public IActionResult UpdateNotification(int id, Notification notification)
    {
        if (id != notification.Id)
            return BadRequest("Notification Id Mismatch");

        var existingNotification = _context.Notifications.Find(id);

        if (existingNotification == null)
            return NotFound("Notification Not Found");

        existingNotification.UserId = notification.UserId;
        existingNotification.Title = notification.Title;
        existingNotification.Message = notification.Message;
        existingNotification.Type = notification.Type;
        existingNotification.IsRead = notification.IsRead;
        existingNotification.CreatedAt = notification.CreatedAt;

        _context.SaveChanges();

        return Ok("Notification Updated Successfully");
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteNotification(int id)
    {
        var notification = _context.Notifications.Find(id);

        if (notification == null)
            return NotFound("Notification Not Found");

        _context.Notifications.Remove(notification);
        _context.SaveChanges();

        return Ok("Notification Deleted Successfully");
    }
}