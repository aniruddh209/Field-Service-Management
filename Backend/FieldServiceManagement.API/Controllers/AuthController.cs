using FieldServiceManagement.API.Data;
using FieldServiceManagement.API.DTOs.Auth;
using FieldServiceManagement.API.Services;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FieldServiceManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly AuthService _authService;
    private readonly JwtService _jwtService;
    private readonly IConfiguration _configuration;
    private readonly IValidator<RegisterUserDto> _registerValidator;
    private readonly IValidator<LoginRequestDto> _loginValidator;

    public AuthController(
        AppDbContext context,
        AuthService authService,
        JwtService jwtService,
        IConfiguration configuration,
        IValidator<RegisterUserDto> registerValidator,
        IValidator<LoginRequestDto> loginValidator)
    {
        _context = context;
        _authService = authService;
        _jwtService = jwtService;
        _configuration = configuration;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterUserDto dto)
    {
        var validationResult = await _registerValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Validation failed.",
                errors = validationResult.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage })
            });
        }

        var result = await _authService.RegisterAsync(dto);

        if (!result)
        {
            return BadRequest(new
            {
                success = false,
                message = "Email already exists."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Registration successful."
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequestDto dto)
    {
        var validationResult = await _loginValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Validation failed.",
                errors = validationResult.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage })
            });
        }

        var result = await _authService.LoginAsync(dto);

        if (result == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid email or password."
            });
        }

        if (!string.IsNullOrEmpty(dto.Role) && !string.Equals(result.User.Role, dto.Role, StringComparison.OrdinalIgnoreCase))
        {
            var isManagementMatch = (dto.Role.Equals("Owner", StringComparison.OrdinalIgnoreCase) || dto.Role.Equals("Manager", StringComparison.OrdinalIgnoreCase))
                && (result.User.Role.Equals("Owner", StringComparison.OrdinalIgnoreCase) || result.User.Role.Equals("Manager", StringComparison.OrdinalIgnoreCase));

            if (!isManagementMatch)
            {
                return BadRequest(new
                {
                    success = false,
                    message = $"Access denied: Account is registered as '{result.User.Role}', but you selected the '{dto.Role}' portal. Please select the '{result.User.Role}' portal tab to sign in."
                });
            }
        }

        return Ok(new
        {
            success = true,
            message = "Login successful.",
            data = result
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RotationRefreshToken([FromBody] RefreshTokenRequestDto dto)
    {
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Id == dto.UserId);

        if (user == null || user.RefreshToken != dto.RefreshToken)
            return Unauthorized(new { success = false, message = "Invalid refresh token." });

        if (user.RefreshTokenExpiryTime < DateTime.UtcNow)
            return Unauthorized(new { success = false, message = "Refresh token expired, please log in again." });

        var newAccessToken = _jwtService.GenerateToken(user);

        // Token Rotation
        var newRefreshToken = _jwtService.GenerateRefreshToken();
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(
            double.Parse(_configuration["Jwt:RefreshTokenExpiresInDays"] ?? "7"));

        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            accessToken = newAccessToken.Token,
            refreshToken = newRefreshToken,
            expiresAt = newAccessToken.ExpiresAt
        });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequestDto dto)
    {
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Id == dto.UserId);
        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await _context.SaveChangesAsync();
        }

        return Ok(new { success = true, message = "Logged out successfully." });
    }
}