using FieldServiceManagement.API.DTOs.Inventory;
using FluentValidation;

namespace FieldServiceManagement.API.Validators.Inventory;

public class AdjustStockValidator : AbstractValidator<AdjustStockDto>
{
    public AdjustStockValidator()
    {
        RuleFor(x => x.QuantityChange)
            .InclusiveBetween(-999999, 999999)
            .WithMessage("Quantity change must be between -999999 and 999999.");

        RuleFor(x => x.Reason)
            .MaximumLength(500)
            .When(x => !string.IsNullOrWhiteSpace(x.Reason))
            .WithMessage("Reason cannot exceed 500 characters.");
    }
}
