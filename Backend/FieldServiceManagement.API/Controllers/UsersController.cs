using System.Security.Claims;
using FieldServiceManagement.API.Data;
using FieldServiceManagement.API.Models;
using FieldServiceManagement.API.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FieldServiceManagement.API.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IFileService _fileService;
    private readonly IValidator<User> _userValidator;

    public UsersController(
        AppDbContext context,
        IFileService fileService,
        IValidator<User> userValidator)
    {
        _context = context;
        _fileService = fileService;
        _userValidator = userValidator;
    }

    [Authorize(Roles = "Owner,Manager,Admin")]
    [HttpGet]
    public IActionResult GetAllUsers()
    {
        var users = _context.Users.ToList();

        return Ok(new
        {
            success = true,
            count = users.Count,
            data = users
        });
    }

    [Authorize(Roles = "Owner,Manager,Admin")]
    [HttpGet("{id}")]
    public IActionResult GetUserById(int id)
    {
        var user = _context.Users.Find(id);

        if (user == null)
        {
            return NotFound("User Not Found");
        }

        return Ok(user);
    }

    [Authorize(Roles = "Owner,Manager,Admin")]
    [HttpPost]
    public async Task<IActionResult> InsertUser(User user)
    {
        var validationResult = await _userValidator.ValidateAsync(user);
        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Validation failed.",
                errors = validationResult.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage })
            });
        }

        _context.Users.Add(user);
        _context.SaveChanges();

        return Ok("User Added Successfully");
    }

    [Authorize(Roles = "Owner,Manager,Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, User user)
    {
        if (id != user.Id)
        {
            return BadRequest("Invalid User Id");
        }

        var validationResult = await _userValidator.ValidateAsync(user);
        if (!validationResult.IsValid)
        {
            return BadRequest(new
            {
                success = false,
                message = "Validation failed.",
                errors = validationResult.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage })
            });
        }

        var existingUser = _context.Users.Find(id);

        if (existingUser == null)
        {
            return NotFound("User Not Found");
        }

        existingUser.FirstName = user.FirstName;
        existingUser.LastName = user.LastName;
        existingUser.Email = user.Email;
        existingUser.PasswordHash = user.PasswordHash;
        existingUser.PhoneNumber = user.PhoneNumber;
        existingUser.Role = user.Role;
        existingUser.ProfileImage = user.ProfileImage;
        existingUser.IsActive = user.IsActive;
        existingUser.UpdatedAt = DateTime.UtcNow;

        _context.SaveChanges();

        return Ok("User Updated Successfully");
    }

    [Authorize(Roles = "Owner,Manager,Admin")]
    [HttpDelete("{id}")]
    public IActionResult DeleteUser(int id, [FromQuery] bool deleteFileOnly = false)
    {
        var user = _context.Users.Find(id);

        if (user == null)
        {
            return NotFound("User Not Found");
        }

        if (deleteFileOnly)
        {
            if (string.IsNullOrEmpty(user.ProfileImage))
                return BadRequest("No profile image exists for this user.");

            _fileService.DeleteFile(user.ProfileImage);
            user.ProfileImage = null;
            _context.SaveChanges();

            return Ok("Profile image deleted successfully.");
        }

        _fileService.DeleteFile(user.ProfileImage);
        _context.Users.Remove(user);
        _context.SaveChanges();

        return Ok("User Deleted Successfully");
    }

    [Authorize]
    [HttpPost("profile-image")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadProfileImage([FromForm] IFormFile file)
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(claim, out var userId))
            return Unauthorized(new { success = false, message = "Invalid user identity." });

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound(new { success = false, message = "User not found." });

        if (file == null || file.Length == 0)
            return BadRequest(new { success = false, message = "No file selected." });

        if (!string.IsNullOrWhiteSpace(user.ProfileImage))
        {
            _fileService.DeleteFile(user.ProfileImage);
        }

        var relativePath = await _fileService.UploadFileAsync(file, "Users");
        user.ProfileImage = relativePath;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = "Profile image uploaded successfully.",
            profileImage = relativePath
        });
    }
}