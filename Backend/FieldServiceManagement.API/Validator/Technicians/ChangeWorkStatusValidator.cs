using FieldServiceManagement.API.DTOs.Technicians;
using FluentValidation;

namespace FieldServiceManagement.API.Validators.Technicians;

public class ChangeWorkStatusValidator : AbstractValidator<ChangeWorkStatusDto>
{
    public ChangeWorkStatusValidator()
    {
        RuleFor(x => x.Status)
            .NotEmpty()
            .WithMessage("Status is required.")
            .MaximumLength(30)
            .WithMessage("Status cannot exceed 30 characters.");
    }
}
