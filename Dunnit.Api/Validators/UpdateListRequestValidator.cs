using Dunnit.Api.Dtos;
using FluentValidation;

namespace Dunnit.Api.Validators;

public class UpdateListRequestValidator : AbstractValidator<UpdateListRequest>
{
    public UpdateListRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200);
    }
}
