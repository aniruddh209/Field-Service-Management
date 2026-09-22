using FieldServiceManagement.API.DTOs.WorkReports;
using FluentValidation;

namespace FieldServiceManagement.API.Validators.WorkReports;

public class UpdateWorkReportValidator : AbstractValidator<UpdateWorkReportDto>
{
    public UpdateWorkReportValidator()
    {
        RuleFor(x => x.Diagnosis)
            .NotEmpty()
            .WithMessage("Diagnosis is required.")
            .MaximumLength(2000)
            .WithMessage("Diagnosis cannot exceed 2000 characters.");

        RuleFor(x => x.WorkPerformed)
            .NotEmpty()
            .WithMessage("Work performed is required.")
            .MaximumLength(2000)
            .WithMessage("Work performed cannot exceed 2000 characters.");

        RuleFor(x => x.LabourHours)
            .InclusiveBetween(0, 24)
            .WithMessage("Labour hours must be between 0 and 24.");

        RuleFor(x => x.SuggestedLabourCharge)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Suggested labour charge cannot be negative.");

        RuleFor(x => x.Resolution)
            .NotEmpty()
            .WithMessage("Resolution is required.")
            .MaximumLength(2000)
            .WithMessage("Resolution cannot exceed 2000 characters.");

        RuleFor(x => x.CustomerSignature)
            .MaximumLength(1000)
            .When(x => !string.IsNullOrWhiteSpace(x.CustomerSignature))
            .WithMessage("Customer signature cannot exceed 1000 characters.");

        RuleFor(x => x.TechnicianRemarks)
            .MaximumLength(2000)
            .When(x => !string.IsNullOrWhiteSpace(x.TechnicianRemarks))
            .WithMessage("Technician remarks cannot exceed 2000 characters.");

        RuleFor(x => x.WarrantyDays)
            .InclusiveBetween(0, 3650)
            .WithMessage("Warranty days must be between 0 and 3650.");

        RuleForEach(x => x.Parts).SetValidator(new WorkReportPartInputValidator());
    }
}
