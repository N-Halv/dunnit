using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Dunnit.Api.ModelBinding;

[AttributeUsage(AttributeTargets.Parameter)]
public class CurrentUserAttribute : ModelBinderAttribute
{
    public CurrentUserAttribute() : base(typeof(CurrentUserModelBinder))
    {
        BindingSource = BindingSource.Special;
    }
}
