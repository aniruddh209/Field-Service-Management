using FieldServiceManagement.API.DTOs.WorkReports;
using FluentValidation;

namespace FieldServiceManagement.API.Validators.WorkReports;

public class AddWorkReportPartValidator : AbstractValidator<AddWorkReportPartDto>
{
    public AddWorkReportPartValidator()
    {
        RuleFor(x => x.InventoryItemId)
            .GreaterThan(0)
            .WithMessage("Valid Inventory Item ID is required.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0)
            .WithMessage("Quantity must be greater than 0.");
    }
}
