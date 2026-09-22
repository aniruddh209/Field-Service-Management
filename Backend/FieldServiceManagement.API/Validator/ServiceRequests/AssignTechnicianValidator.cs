using FieldServiceManagement.API.DTOs.ServiceRequests;
using FluentValidation;

namespace FieldServiceManagement.API.Validators.ServiceRequests;

public class AssignTechnicianValidator : AbstractValidator<AssignTechnicianDto>
{
    public AssignTechnicianValidator()
    {
        RuleFor(x => x.TechnicianId)
            .GreaterThan(0)
            .WithMessage("Valid Technician ID is required.");
    }
}
