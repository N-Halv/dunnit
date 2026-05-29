using Dunnit.Api.Data;
using Dunnit.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Dunnit.Api.Services;

public interface IItemService
{
    Task<List<TodoItem>?> GetForListAsync(Guid userId, Guid listId, CancellationToken cancellationToken);

    Task<TodoItem?> GetByIdAsync(Guid userId, Guid listId, Guid itemId, CancellationToken cancellationToken);

    Task<TodoItem?> CreateAsync(Guid userId, Guid listId, string title, string? description, CancellationToken cancellationToken);

    Task<TodoItem?> UpdateAsync(Guid userId, Guid listId, Guid itemId, string title, string? description, bool completed, CancellationToken cancellationToken);

    Task<ReorderResult<TodoItem>> ReorderAsync(Guid userId, Guid listId, Guid itemId, Guid? precedingItemId, CancellationToken cancellationToken);

    Task<bool> SoftDeleteAsync(Guid userId, Guid listId, Guid itemId, CancellationToken cancellationToken);
}

public class ItemService : IItemService
{
    private readonly AppDbContext _db;

    public ItemService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<TodoItem>?> GetForListAsync(Guid userId, Guid listId, CancellationToken cancellationToken)
    {
        if (!await UserOwnsListAsync(userId, listId, cancellationToken))
        {
            return null;
        }

        return await _db.Items
            .Where(i => i.ListId == listId)
            .OrderBy(i => i.SortOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<TodoItem?> GetByIdAsync(Guid userId, Guid listId, Guid itemId, CancellationToken cancellationToken)
    {
        if (!await UserOwnsListAsync(userId, listId, cancellationToken))
        {
            return null;
        }

        return await _db.Items.FirstOrDefaultAsync(
            i => i.Id == itemId && i.ListId == listId,
            cancellationToken);
    }

    public async Task<TodoItem?> CreateAsync(Guid userId, Guid listId, string title, string? description, CancellationToken cancellationToken)
    {
        if (!await UserOwnsListAsync(userId, listId, cancellationToken))
        {
            return null;
        }

        var maxSort = await _db.Items
            .Where(i => i.ListId == listId)
            .Select(i => (double?)i.SortOrder)
            .MaxAsync(cancellationToken);

        var item = new TodoItem
        {
            Id = Guid.NewGuid(),
            ListId = listId,
            Title = title,
            Description = description,
            SortOrder = (maxSort ?? 0d) + 1d,
        };
        _db.Items.Add(item);
        await _db.SaveChangesAsync(cancellationToken);
        return item;
    }

    public async Task<TodoItem?> UpdateAsync(Guid userId, Guid listId, Guid itemId, string title, string? description, bool completed, CancellationToken cancellationToken)
    {
        var item = await GetByIdAsync(userId, listId, itemId, cancellationToken);
        if (item is null)
        {
            return null;
        }

        item.Title = title;
        item.Description = description;
        // Only flip CompletedAt on a state transition so re-saving other fields
        // doesn't reset the original completion timestamp.
        if (completed && item.CompletedAt is null)
        {
            item.CompletedAt = DateTimeOffset.UtcNow;
        }
        else if (!completed && item.CompletedAt is not null)
        {
            item.CompletedAt = null;
        }
        await _db.SaveChangesAsync(cancellationToken);
        return item;
    }

    public async Task<ReorderResult<TodoItem>> ReorderAsync(
        Guid userId,
        Guid listId,
        Guid itemId,
        Guid? precedingItemId,
        CancellationToken cancellationToken)
    {
        if (precedingItemId == itemId)
        {
            return ReorderResult<TodoItem>.SamePreceding();
        }

        var item = await GetByIdAsync(userId, listId, itemId, cancellationToken);
        if (item is null)
        {
            return ReorderResult<TodoItem>.NotFound();
        }

        double newSortOrder;
        if (precedingItemId is null)
        {
            var minOther = await _db.Items
                .Where(i => i.ListId == listId && i.Id != itemId)
                .Select(i => (double?)i.SortOrder)
                .MinAsync(cancellationToken);

            newSortOrder = minOther.HasValue ? minOther.Value - 1d : 1d;
        }
        else
        {
            var preceding = await _db.Items.FirstOrDefaultAsync(
                i => i.Id == precedingItemId.Value && i.ListId == listId,
                cancellationToken);
            if (preceding is null)
            {
                return ReorderResult<TodoItem>.PrecedingNotFound();
            }

            var nextSort = await _db.Items
                .Where(i => i.ListId == listId
                    && i.Id != itemId
                    && i.SortOrder > preceding.SortOrder)
                .OrderBy(i => i.SortOrder)
                .Select(i => (double?)i.SortOrder)
                .FirstOrDefaultAsync(cancellationToken);

            newSortOrder = nextSort.HasValue
                ? (preceding.SortOrder + nextSort.Value) / 2d
                : preceding.SortOrder + 1d;
        }

        item.SortOrder = newSortOrder;
        await _db.SaveChangesAsync(cancellationToken);
        return ReorderResult<TodoItem>.Success(item);
    }

    public async Task<bool> SoftDeleteAsync(Guid userId, Guid listId, Guid itemId, CancellationToken cancellationToken)
    {
        var item = await GetByIdAsync(userId, listId, itemId, cancellationToken);
        if (item is null)
        {
            return false;
        }

        item.DeletedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private Task<bool> UserOwnsListAsync(Guid userId, Guid listId, CancellationToken cancellationToken) =>
        _db.Lists.AnyAsync(l => l.Id == listId && l.CreatorUserId == userId, cancellationToken);
}
