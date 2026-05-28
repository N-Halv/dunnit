using be_dunnit.Data;
using be_dunnit.Models;
using Microsoft.EntityFrameworkCore;

namespace be_dunnit.Services;

public interface IListService
{
    Task<List<TodoList>> GetForUserAsync(Guid userId, CancellationToken cancellationToken);

    Task<TodoList?> GetByIdAsync(Guid userId, Guid listId, CancellationToken cancellationToken);

    Task<TodoList> CreateAsync(Guid userId, string name, CancellationToken cancellationToken);

    Task<TodoList?> UpdateAsync(Guid userId, Guid listId, string name, CancellationToken cancellationToken);

    Task<ReorderResult<TodoList>> ReorderAsync(Guid userId, Guid listId, Guid? precedingListId, CancellationToken cancellationToken);

    Task<bool> SoftDeleteAsync(Guid userId, Guid listId, CancellationToken cancellationToken);
}

public class ListService : IListService
{
    private readonly AppDbContext _db;

    public ListService(AppDbContext db)
    {
        _db = db;
    }

    public Task<List<TodoList>> GetForUserAsync(Guid userId, CancellationToken cancellationToken) =>
        _db.Lists
            .Where(l => l.CreatorUserId == userId)
            .OrderBy(l => l.SortOrder)
            .ToListAsync(cancellationToken);

    public Task<TodoList?> GetByIdAsync(Guid userId, Guid listId, CancellationToken cancellationToken) =>
        _db.Lists.FirstOrDefaultAsync(l => l.Id == listId && l.CreatorUserId == userId, cancellationToken);

    public async Task<TodoList> CreateAsync(Guid userId, string name, CancellationToken cancellationToken)
    {
        var maxSort = await _db.Lists
            .Where(l => l.CreatorUserId == userId)
            .Select(l => (double?)l.SortOrder)
            .MaxAsync(cancellationToken);


        // Note: small chance of race condition if two lists are created at the same time, side effects are minimal and deemed acceptable for this app, so not implementing any locking or retry logic.
        var list = new TodoList
        {
            Id = Guid.NewGuid(),
            CreatorUserId = userId,
            Name = name,
            SortOrder = (maxSort ?? 0d) + 1d,
        };
        _db.Lists.Add(list);
        await _db.SaveChangesAsync(cancellationToken);
        return list;
    }

    public async Task<TodoList?> UpdateAsync(Guid userId, Guid listId, string name, CancellationToken cancellationToken)
    {
        var list = await GetByIdAsync(userId, listId, cancellationToken);
        if (list is null)
        {
            return null;
        }

        list.Name = name;
        await _db.SaveChangesAsync(cancellationToken);
        return list;
    }

    public async Task<ReorderResult<TodoList>> ReorderAsync(
        Guid userId,
        Guid listId,
        Guid? precedingListId,
        CancellationToken cancellationToken)
    {
        if (precedingListId == listId)
        {
            return ReorderResult<TodoList>.SamePreceding();
        }

        var list = await GetByIdAsync(userId, listId, cancellationToken);
        if (list is null)
        {
            return ReorderResult<TodoList>.NotFound();
        }

        double newSortOrder;
        if (precedingListId is null)
        {
            // Move to top: pick a value below the current minimum (excluding self).
            var minOther = await _db.Lists
                .Where(l => l.CreatorUserId == userId && l.Id != listId)
                .Select(l => (double?)l.SortOrder)
                .MinAsync(cancellationToken);

            newSortOrder = minOther.HasValue ? minOther.Value - 1d : 1d;
        }
        else
        {
            var preceding = await GetByIdAsync(userId, precedingListId.Value, cancellationToken);
            if (preceding is null)
            {
                return ReorderResult<TodoList>.PrecedingNotFound();
            }

            var nextSort = await _db.Lists
                .Where(l => l.CreatorUserId == userId
                    && l.Id != listId
                    && l.SortOrder > preceding.SortOrder)
                .OrderBy(l => l.SortOrder)
                .Select(l => (double?)l.SortOrder)
                .FirstOrDefaultAsync(cancellationToken);

            newSortOrder = nextSort.HasValue
                ? (preceding.SortOrder + nextSort.Value) / 2d
                : preceding.SortOrder + 1d;
        }

        list.SortOrder = newSortOrder;
        await _db.SaveChangesAsync(cancellationToken);
        return ReorderResult<TodoList>.Success(list);
    }

    public async Task<bool> SoftDeleteAsync(Guid userId, Guid listId, CancellationToken cancellationToken)
    {
        var list = await GetByIdAsync(userId, listId, cancellationToken);
        if (list is null)
        {
            return false;
        }

        list.DeletedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
