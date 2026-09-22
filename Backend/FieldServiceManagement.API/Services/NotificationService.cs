using FieldServiceManagement.API.Data;
using FieldServiceManagement.API.DTOs.Notifications;
using FieldServiceManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FieldServiceManagement.API.Services;

public class NotificationService
{
    private readonly AppDbContext _context;

    public NotificationService(AppDbContext context)
    {
        _context = context;
    }


    public async Task<List<NotificationDto>> GetMyNotificationsAsync(
        int userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                RelatedEntityType = n.RelatedEntityType,
                RelatedEntityId = n.RelatedEntityId,
                IsRead = n.IsRead,
                ReadAt = n.ReadAt,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync();
    }


    public async Task<NotificationDto?> GetByIdAsync(
        int userId,
        int notificationId)
    {
        return await _context.Notifications
            .Where(n =>
                n.Id == notificationId &&
                n.UserId == userId)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                RelatedEntityType = n.RelatedEntityType,
                RelatedEntityId = n.RelatedEntityId,
                IsRead = n.IsRead,
                ReadAt = n.ReadAt,
                CreatedAt = n.CreatedAt
            })
            .FirstOrDefaultAsync();
    }


    public async Task<NotificationCountDto> GetCountAsync(
        int userId)
    {
        var total = await _context.Notifications
            .CountAsync(n => n.UserId == userId);

        var unread = await _context.Notifications
            .CountAsync(n =>
                n.UserId == userId &&
                !n.IsRead);

        return new NotificationCountDto
        {
            Total = total,
            Unread = unread
        };
    }


    public async Task<bool> MarkAsReadAsync(
        int userId,
        int notificationId)
    {
        var notification =
            await _context.Notifications
                .FirstOrDefaultAsync(n =>
                    n.Id == notificationId &&
                    n.UserId == userId);

        if (notification == null)
        {
            return false;
        }

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        return true;
    }


    public async Task<int> MarkAllAsReadAsync(
        int userId)
    {
        var notifications =
            await _context.Notifications
                .Where(n =>
                    n.UserId == userId &&
                    !n.IsRead)
                .ToListAsync();

        if (notifications.Count == 0)
        {
            return 0;
        }

        var readAt = DateTime.UtcNow;

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.ReadAt = readAt;
        }

        await _context.SaveChangesAsync();

        return notifications.Count;
    }


    public async Task<NotificationDto> CreateAsync(
        CreateNotificationDto dto)
    {
        var notification = new Notification
        {
            UserId = dto.UserId,
            Title = dto.Title,
            Message = dto.Message,
            Type = dto.Type,
            RelatedEntityType = dto.RelatedEntityType,
            RelatedEntityId = dto.RelatedEntityId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();

        return new NotificationDto
        {
            Id = notification.Id,
            Title = notification.Title,
            Message = notification.Message,
            Type = notification.Type,
            RelatedEntityType =
                notification.RelatedEntityType,
            RelatedEntityId =
                notification.RelatedEntityId,
            IsRead = notification.IsRead,
            ReadAt = notification.ReadAt,
            CreatedAt = notification.CreatedAt
        };
    }


    public async Task<bool> DeleteAsync(int userId, int notificationId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification == null) return false;

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();
        return true;
    }


    public async Task<int> ClearAllAsync(int userId)
    {
        var userNotifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .ToListAsync();

        if (userNotifications.Count == 0) return 0;

        _context.Notifications.RemoveRange(userNotifications);
        await _context.SaveChangesAsync();
        return userNotifications.Count;
    }
}