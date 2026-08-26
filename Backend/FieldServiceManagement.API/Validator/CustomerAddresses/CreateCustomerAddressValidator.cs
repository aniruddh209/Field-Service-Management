using FieldServiceManagement.API.DTOs.CustomerAddresses;
using FluentValidation;

namespace FieldServiceManagement.API.Validators.CustomerAddresses;

public class CreateCustomerAddressValidator
    : AbstractValidator<CreateCustomerAddressDto>
{
    public CreateCustomerAddressValidator()
    {
        RuleFor(x => x.AddressTitle)
            .NotEmpty()
            .WithMessage("Address title is required.")
            .MaximumLength(100)
            .WithMessage("Address title cannot exceed 100 characters.");

        RuleFor(x => x.AddressLine)
            .NotEmpty()
            .WithMessage("Address line is required.")
            .MaximumLength(300)
            .WithMessage("Address line cannot exceed 300 characters.");

        RuleFor(x => x.Area)
            .NotEmpty()
            .WithMessage("Area is required.")
            .MaximumLength(150)
            .WithMessage("Area cannot exceed 150 characters.");

        RuleFor(x => x.City)
            .NotEmpty()
            .WithMessage("City is required.")
            .MaximumLength(100)
            .WithMessage("City cannot exceed 100 characters.");

        RuleFor(x => x.State)
            .NotEmpty()
            .WithMessage("State is required.")
            .MaximumLength(100)
            .WithMessage("State cannot exceed 100 characters.");

        RuleFor(x => x.Pincode)
            .NotEmpty()
            .WithMessage("Pincode is required.")
            .Matches(@"^\d{6}$")
            .WithMessage("Pincode must contain exactly 6 digits.");

        RuleFor(x => x.Landmark)
            .MaximumLength(200)
            .When(x => !string.IsNullOrWhiteSpace(x.Landmark))
            .WithMessage("Landmark cannot exceed 200 characters.");
    }
}