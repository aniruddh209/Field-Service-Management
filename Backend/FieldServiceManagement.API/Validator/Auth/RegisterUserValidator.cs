using FieldServiceManagement.API.DTOs.Auth;
using FluentValidation;

namespace FieldServiceManagement.API.Validators.Auth;

public class RegisterUserValidator : AbstractValidator<RegisterUserDto>
{
    public RegisterUserValidator()
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

        RuleFor(x => x.Password)
            .NotEmpty()
            .WithMessage("Password is required.")
            .Length(8, 100)
            .WithMessage("Password must be between 8 and 100 characters.");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty()
            .WithMessage("Phone number is required.")
            .MaximumLength(20)
            .WithMessage("Phone number cannot exceed 20 characters.");

        RuleFor(x => x.Role)
            .NotEmpty()
            .WithMessage("Role is required.");
    }
}
