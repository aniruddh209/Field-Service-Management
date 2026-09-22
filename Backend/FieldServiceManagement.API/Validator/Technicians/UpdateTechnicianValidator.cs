using FieldServiceManagement.API.DTOs.Technicians;
using FluentValidation;

namespace FieldServiceManagement.API.Validators.Technicians;

public class UpdateTechnicianValidator
    : AbstractValidator<UpdateTechnicianDto>
{
    public UpdateTechnicianValidator()
    {
        RuleFor(x => x.Specialization)
            .NotEmpty()
            .WithMessage("Specialization is required.")
            .MaximumLength(100)
            .WithMessage("Specialization cannot exceed 100 characters.");

        RuleFor(x => x.ExperienceYears)
            .InclusiveBetween(0, 40)
            .WithMessage("Experience years must be between 0 and 40.");

        RuleFor(x => x.CurrentLocation)
            .MaximumLength(100)
            .When(x => !string.IsNullOrWhiteSpace(x.CurrentLocation))
            .WithMessage("Current location cannot exceed 100 characters.");

        RuleFor(x => x.Notes)
            .MaximumLength(500)
            .When(x => !string.IsNullOrWhiteSpace(x.Notes))
            .WithMessage("Notes cannot exceed 500 characters.");
    }
}