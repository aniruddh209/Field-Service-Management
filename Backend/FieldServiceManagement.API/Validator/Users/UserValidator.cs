using FieldServiceManagement.API.Models;
using FluentValidation;

namespace FieldServiceManagement.API.Validators.Users;

public class UserValidator : AbstractValidator<User>
{
    public UserValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty()
            .WithMessage("First name is required.")
            .Length(2, 100)
            .WithMessage("First name must be between 2 and 100 characters.");

        RuleFor(x => x.LastName)
            .NotEmpty()
            .WithMessage("Last name is required.")
            .Length(2, 100)
            .WithMessage("Last name must be between 2 and 100 characters.");

        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("Email is required.")
            .EmailAddress()
            .WithMessage("Invalid email address format.")
            .MaximumLength(150)
            .WithMessage("Email cannot exceed 150 characters.");

        RuleFor(x => x.PasswordHash)
            .NotEmpty()
            .WithMessage("Password is required.");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty()
            .WithMessage("Phone number is required.")
            .MaximumLength(20)
            .WithMessage("Phone number cannot exceed 20 characters.");

        RuleFor(x => x.Role)
            .NotEmpty()
            .WithMessage("Role is required.")
            .MaximumLength(30)
            .WithMessage("Role cannot exceed 30 characters.");
    }
}
