using FieldServiceManagement.API.DTOs.Invoices;
using FluentValidation;

namespace FieldServiceManagement.API.Validators.Invoices;

public class CreateInvoiceValidator : AbstractValidator<CreateInvoiceDto>
{
    public CreateInvoiceValidator()
    {
        RuleFor(x => x.ServiceRequestId)
            .GreaterThan(0)
            .WithMessage("Valid Service Request ID is required.");

        RuleFor(x => x.ServiceCharge)
            .GreaterThanOrEqualTo(0)
            .When(x => x.ServiceCharge.HasValue)
            .WithMessage("Service charge cannot be negative.");

        RuleFor(x => x.LabourCharge)
            .GreaterThanOrEqualTo(0)
            .When(x => x.LabourCharge.HasValue)
            .WithMessage("Labour charge cannot be negative.");

        RuleFor(x => x.TaxAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Tax amount cannot be negative.");

        RuleFor(x => x.Notes)
            .MaximumLength(1000)
            .When(x => !string.IsNullOrWhiteSpace(x.Notes))
            .WithMessage("Notes cannot exceed 1000 characters.");
    }
}
