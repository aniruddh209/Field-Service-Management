using FieldServiceManagement.API.Data;
using FieldServiceManagement.API.DTOs.Auth;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using FieldServiceManagement.API.Models;

namespace FieldServiceManagement.API.Services;

public class AuthService
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;
    private readonly IConfiguration _configuration;

    public AuthService(
        AppDbContext context,
        JwtService jwtService,
        IConfiguration configuration)
    {
        _context = context;
        _jwtService = jwtService;
        _configuration = configuration;
    }

    public async Task<bool> RegisterAsync(RegisterUserDto dto)
    {
        var emailExists = await _context.Users
            .AnyAsync(u => u.Email == dto.Email);

        if (emailExists)
        {
            return false;
        }

        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            Role = dto.Role,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == dto.Email);

        if (user == null)
            return null;

        var validPassword = BCrypt.Net.BCrypt.Verify(
            dto.Password,
            user.PasswordHash
        );

        if (!validPassword)
            return null;

        var tokenResult = _jwtService.GenerateToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(
            double.Parse(_configuration["Jwt:RefreshTokenExpiresInDays"] ?? "7")
        );

        await _context.SaveChangesAsync();

        return new LoginResponseDto
        {
            Token = tokenResult.Token,
            RefreshToken = refreshToken,
            ExpiresAt = tokenResult.ExpiresAt,
            User = new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                ProfileImage = user.ProfileImage,
                IsActive = user.IsActive
            }
        };
    }
}