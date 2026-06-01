using Dunnit.Api.Data;
using Dunnit.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Dunnit.Api.Services;

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

        // NOTE: Two concurrent creates can land on the same SortOrder; we accept that
        // because a tie just means an undefined ordering between the two new
        // entries, which the user can fix by dragging and isn't likely a critical problem.
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
