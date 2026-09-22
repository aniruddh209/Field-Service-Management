using FieldServiceManagement.API.DTOs.Inventory;
using FluentValidation;

namespace FieldServiceManagement.API.Validators.Inventory;

public class UpdateInventoryItemValidator : AbstractValidator<UpdateInventoryItemDto>
{
    public UpdateInventoryItemValidator()
    {
        RuleFor(x => x.SKU)
            .NotEmpty()
            .WithMessage("SKU is required.")
            .MaximumLength(100)
            .WithMessage("SKU cannot exceed 100 characters.");

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Item name is required.")
            .MaximumLength(200)
            .WithMessage("Item name cannot exceed 200 characters.");

        RuleFor(x => x.Category)
            .MaximumLength(100)
            .When(x => !string.IsNullOrWhiteSpace(x.Category))
            .WithMessage("Category cannot exceed 100 characters.");

        RuleFor(x => x.QuantityInStock)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Quantity in stock cannot be negative.");

        RuleFor(x => x.ReorderLevel)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Reorder level cannot be negative.");

        RuleFor(x => x.UnitPrice)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Unit price cannot be negative.");
    }
}
