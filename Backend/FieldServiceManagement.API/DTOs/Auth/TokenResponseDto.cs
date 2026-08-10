namespace FieldServiceManagement.API.DTOs.Auth;

public class TokenResponseDto
{
    public string Token { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }
}