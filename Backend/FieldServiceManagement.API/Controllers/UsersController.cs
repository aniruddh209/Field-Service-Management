using FieldServiceManagement.API.Data;
using FieldServiceManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FieldServiceManagement.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    #region Configuration

    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    #endregion

    #region Get All Users

    // GET : api/Users

    [HttpGet]

    public IActionResult GetAllUsers()
    {
        var users = _context.Users.ToList();

        return Ok(users);
    }

    #endregion

    #region Get User By Id

    // GET : api/Users/1

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

    #endregion

    #region Insert User

    // POST : api/Users

    [HttpPost]

    public IActionResult InsertUser(User user)
    {
        _context.Users.Add(user);

        _context.SaveChanges();

        return Ok("User Added Successfully");
    }

    #endregion

    #region Update User

    // PUT : api/Users/1

    [HttpPut("{id}")]

    public IActionResult UpdateUser(int id, User user)
    {
        if (id != user.Id)
        {
            return BadRequest("Invalid User Id");
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

    #endregion

    #region Delete User

    // DELETE : api/Users/1

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

    #endregion
}