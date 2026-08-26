using FieldServiceManagement.API.DTOs.Auth;
using FieldServiceManagement.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace FieldServiceManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }
    
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterUserDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

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
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

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
}