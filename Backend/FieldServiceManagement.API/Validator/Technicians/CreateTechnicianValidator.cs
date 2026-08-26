using FluentValidation;
using FieldServiceManagement.API.DTOs.Technicians;

namespace FieldServiceManagement.API.Validators.Technicians;

public class CreateTechnicianValidator
    : AbstractValidator<CreateTechnicianDto>
{
    public CreateTechnicianValidator()
    {
        RuleFor(x => x.UserId)
            .GreaterThan(0)
            .WithMessage("Please select a valid user.");

        RuleFor(x => x.EmployeeCode)
            .NotEmpty()
            .WithMessage("Employee code is required.")
            .Must(x => !string.IsNullOrWhiteSpace(x))
            .WithMessage("Employee code cannot be empty or whitespace.")
            .MaximumLength(20)
            .WithMessage("Employee code cannot exceed 20 characters.");

        RuleFor(x => x.Specialization)
            .NotEmpty()
            .WithMessage("Specialization is required.")
            .Must(x => !string.IsNullOrWhiteSpace(x))
            .WithMessage("Specialization cannot be empty or whitespace.")
            .MaximumLength(100)
            .WithMessage("Specialization cannot exceed 100 characters.");

        RuleFor(x => x.ExperienceYears)
            .InclusiveBetween(0, 40)
            .WithMessage("Experience years must be between 0 and 40.");

        RuleFor(x => x.CurrentLocation)
            .MaximumLength(100)
            .WithMessage("Current location cannot exceed 100 characters.");

        RuleFor(x => x.Notes)
            .MaximumLength(500)
            .WithMessage("Notes cannot exceed 500 characters.");
    }
}