namespace FieldServiceManagement.API.DTOs.Notifications;

public class CreateNotificationDto
{
    public int UserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public string? RelatedEntityType { get; set; }

    public int? RelatedEntityId { get; set; }
}