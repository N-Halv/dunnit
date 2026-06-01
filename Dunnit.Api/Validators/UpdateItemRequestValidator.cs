using Dunnit.Api.Dtos;
using FluentValidation;

namespace Dunnit.Api.Validators;

public class UpdateItemRequestValidator : AbstractValidator<UpdateItemRequest>
{
    public UpdateItemRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(ValidationLimits.ItemTitleMaxLength);

        RuleFor(x => x.Description)
            .MaximumLength(ValidationLimits.ItemDescriptionMaxLength);
    }
}
