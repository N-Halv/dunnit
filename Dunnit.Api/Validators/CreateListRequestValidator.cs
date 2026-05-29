using Dunnit.Api.Dtos;
using FluentValidation;

namespace Dunnit.Api.Validators;

public class CreateListRequestValidator : AbstractValidator<CreateListRequest>
{
    public CreateListRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200);
    }
}
