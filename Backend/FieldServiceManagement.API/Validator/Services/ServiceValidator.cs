using FieldServiceManagement.API.Models;
using FluentValidation;

namespace FieldServiceManagement.API.Validators.Services;

public class ServiceValidator : AbstractValidator<Service>
{
    public ServiceValidator()
    {
        RuleFor(x => x.ServiceName)
            .NotEmpty()
            .WithMessage("Service name is required.")
            .MaximumLength(100)
            .WithMessage("Service name cannot exceed 100 characters.");

        RuleFor(x => x.Category)
            .NotEmpty()
            .WithMessage("Category is required.")
            .MaximumLength(50)
            .WithMessage("Category cannot exceed 50 characters.");

        RuleFor(x => x.Description)
            .NotEmpty()
            .WithMessage("Description is required.");

        RuleFor(x => x.BasePrice)
            .InclusiveBetween(1, 100000)
            .WithMessage("Base price must be between 1 and 100000.");

        RuleFor(x => x.EstimatedHours)
            .InclusiveBetween(1, 24)
            .WithMessage("Estimated hours must be between 1 and 24.");
    }
}
