using FieldServiceManagement.API.DTOs.Assets;
using FluentValidation;

namespace FieldServiceManagement.API.Validators.Assets;

public class CreateAssetValidator : AbstractValidator<CreateAssetDto>
{
    public CreateAssetValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Asset name is required.")
            .MaximumLength(200)
            .WithMessage("Asset name cannot exceed 200 characters.");

        RuleFor(x => x.Brand)
            .MaximumLength(100)
            .When(x => !string.IsNullOrWhiteSpace(x.Brand))
            .WithMessage("Brand cannot exceed 100 characters.");

        RuleFor(x => x.Model)
            .MaximumLength(100)
            .When(x => !string.IsNullOrWhiteSpace(x.Model))
            .WithMessage("Model cannot exceed 100 characters.");

        RuleFor(x => x.SerialNumber)
            .MaximumLength(100)
            .When(x => !string.IsNullOrWhiteSpace(x.SerialNumber))
            .WithMessage("Serial number cannot exceed 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .When(x => !string.IsNullOrWhiteSpace(x.Description))
            .WithMessage("Description cannot exceed 1000 characters.");
    }
}
