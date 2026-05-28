namespace be_dunnit.Services;

public enum ReorderStatus
{
    Success,
    NotFound,
    PrecedingNotFound,
    SamePreceding,
}

public record ReorderResult<T>(ReorderStatus Status, T? Value)
{
    public static ReorderResult<T> Success(T value) => new(ReorderStatus.Success, value);

    public static ReorderResult<T> NotFound() => new(ReorderStatus.NotFound, default);

    public static ReorderResult<T> PrecedingNotFound() => new(ReorderStatus.PrecedingNotFound, default);

    public static ReorderResult<T> SamePreceding() => new(ReorderStatus.SamePreceding, default);
}
