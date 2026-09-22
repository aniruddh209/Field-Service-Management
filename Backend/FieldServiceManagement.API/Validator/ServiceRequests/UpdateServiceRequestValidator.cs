using FieldServiceManagement.API.DTOs.ServiceRequests;
using FluentValidation;

namespace FieldServiceManagement.API.Validators.ServiceRequests;

public class UpdateServiceRequestValidator : AbstractValidator<UpdateServiceRequestDto>
{
    public UpdateServiceRequestValidator()
    {
        RuleFor(x => x.ServiceId)
            .GreaterThan(0)
            .WithMessage("Please select a valid service.");

        RuleFor(x => x.ProblemDescription)
            .NotEmpty()
            .WithMessage("Problem description is required.")
            .Length(10, 500)
            .WithMessage("Problem description must be between 10 and 500 characters.");

        RuleFor(x => x.ServiceAddress)
            .NotEmpty()
            .WithMessage("Service address is required.")
            .MaximumLength(300)
            .WithMessage("Service address cannot exceed 300 characters.");

        RuleFor(x => x.PreferredDate)
            .NotEmpty()
            .WithMessage("Preferred date is required.");

        RuleFor(x => x.Notes)
            .MaximumLength(500)
            .When(x => !string.IsNullOrWhiteSpace(x.Notes))
            .WithMessage("Notes cannot exceed 500 characters.");
    }
}
