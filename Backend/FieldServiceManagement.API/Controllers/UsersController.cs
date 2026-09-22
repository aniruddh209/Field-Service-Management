using FieldServiceManagement.API.Data;
using FieldServiceManagement.API.Models;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldServiceManagement.API.Controllers;

[Authorize(Roles = "Owner,Manager,Admin")]
[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IValidator<User> _userValidator;

    public UsersController(
        AppDbContext context,
        IValidator<User> userValidator)
    {
        _context = context;
        _userValidator = userValidator;
    }

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
        existingUser.UpdatedAt = DateTime.Now;

        _context.SaveChanges();

        return Ok("User Updated Successfully");
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteUser(int id)
    {
        var user = _context.Users.Find(id);

        if (user == null)
        {
            return NotFound("User Not Found");
        }

        _context.Users.Remove(user);
        _context.SaveChanges();

        return Ok("User Deleted Successfully");
    }
}