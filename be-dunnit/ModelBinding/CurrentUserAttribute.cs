using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace be_dunnit.ModelBinding;

[AttributeUsage(AttributeTargets.Parameter)]
public class CurrentUserAttribute : ModelBinderAttribute
{
    public CurrentUserAttribute() : base(typeof(CurrentUserModelBinder))
    {
        BindingSource = BindingSource.Special;
    }
}
