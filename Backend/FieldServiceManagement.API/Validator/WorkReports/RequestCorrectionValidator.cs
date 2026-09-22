using FieldServiceManagement.API.DTOs.WorkReports;
using FluentValidation;

namespace FieldServiceManagement.API.Validators.WorkReports;

public class RequestCorrectionValidator : AbstractValidator<RequestCorrectionDto>
{
    public RequestCorrectionValidator()
    {
        RuleFor(x => x.CorrectionReason)
            .NotEmpty()
            .WithMessage("Correction reason is required.")
            .MaximumLength(1000)
            .WithMessage("Correction reason cannot exceed 1000 characters.");
    }
}
