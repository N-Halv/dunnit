using be_dunnit.Dtos;
using FluentValidation;

namespace be_dunnit.Validators;

public class UpdateListRequestValidator : AbstractValidator<UpdateListRequest>
{
    public UpdateListRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200);
    }
}
