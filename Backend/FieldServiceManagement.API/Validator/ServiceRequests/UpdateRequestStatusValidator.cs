using FieldServiceManagement.API.DTOs.ServiceRequests;
using FluentValidation;

namespace FieldServiceManagement.API.Validators.ServiceRequests;

public class UpdateRequestStatusValidator : AbstractValidator<UpdateRequestStatusDto>
{
    public UpdateRequestStatusValidator()
    {
        RuleFor(x => x.Status)
            .NotEmpty()
            .WithMessage("Status is required.")
            .MaximumLength(30)
            .WithMessage("Status cannot exceed 30 characters.");

        RuleFor(x => x.Notes)
            .MaximumLength(500)
            .When(x => !string.IsNullOrWhiteSpace(x.Notes))
            .WithMessage("Notes cannot exceed 500 characters.");
    }
}
