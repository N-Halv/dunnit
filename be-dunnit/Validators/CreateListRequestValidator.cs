using be_dunnit.Dtos;
using FluentValidation;

namespace be_dunnit.Validators;

public class CreateListRequestValidator : AbstractValidator<CreateListRequest>
{
    public CreateListRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200);
    }
}
