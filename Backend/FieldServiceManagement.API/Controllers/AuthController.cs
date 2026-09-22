using FieldServiceManagement.API.DTOs.Auth;
using FieldServiceManagement.API.Services;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace FieldServiceManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly IValidator<RegisterUserDto> _registerValidator;
    private readonly IValidator<LoginRequestDto> _loginValidator;

    public AuthController(
        AuthService authService,
        IValidator<RegisterUserDto> registerValidator,
        IValidator<LoginRequestDto> loginValidator)
    {
        _authService = authService;
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
}