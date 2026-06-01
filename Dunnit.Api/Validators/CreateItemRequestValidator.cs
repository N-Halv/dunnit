using Dunnit.Api.Dtos;
using FluentValidation;

namespace Dunnit.Api.Validators;

public class CreateItemRequestValidator : AbstractValidator<CreateItemRequest>
{
    public CreateItemRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(ValidationLimits.ItemTitleMaxLength);

        RuleFor(x => x.Description)
            .MaximumLength(ValidationLimits.ItemDescriptionMaxLength);
    }
}
