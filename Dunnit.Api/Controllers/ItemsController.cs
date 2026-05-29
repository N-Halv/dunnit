using Dunnit.Api.Dtos;
using Dunnit.Api.ModelBinding;
using Dunnit.Api.Models;
using Dunnit.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dunnit.Api.Controllers;

[ApiController]
[Route("lists/{listId:guid}/items")]
public class ItemsController : ControllerBase
{
    private readonly IItemService _itemService;

    public ItemsController(IItemService itemService)
    {
        _itemService = itemService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ItemResponse>>> Get(
        Guid listId,
        [CurrentUser] User user,
        CancellationToken cancellationToken)
    {
        var items = await _itemService.GetForListAsync(user.Id, listId, cancellationToken);
        if (items is null)
        {
            return NotFound();
        }
        return Ok(items.Select(ToResponse));
    }

    [HttpPost]
    public async Task<ActionResult<ItemResponse>> Create(
        Guid listId,
        CreateItemRequest request,
        [CurrentUser] User user,
        CancellationToken cancellationToken)
    {
        var item = await _itemService.CreateAsync(user.Id, listId, request.Title, request.Description, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }
        return CreatedAtAction(nameof(GetById), new { listId, itemId = item.Id }, ToResponse(item));
    }

    [HttpGet("{itemId:guid}")]
    public async Task<ActionResult<ItemResponse>> GetById(
        Guid listId,
        Guid itemId,
        [CurrentUser] User user,
        CancellationToken cancellationToken)
    {
        var item = await _itemService.GetByIdAsync(user.Id, listId, itemId, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }
        return ToResponse(item);
    }

    [HttpPatch("{itemId:guid}")]
    public async Task<ActionResult<ItemResponse>> Update(
        Guid listId,
        Guid itemId,
        UpdateItemRequest request,
        [CurrentUser] User user,
        CancellationToken cancellationToken)
    {
        var item = await _itemService.UpdateAsync(user.Id, listId, itemId, request.Title, request.Description, request.Completed, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }
        return ToResponse(item);
    }

    [HttpPatch("{itemId:guid}/position")]
    public async Task<ActionResult<ItemResponse>> UpdatePosition(
        Guid listId,
        Guid itemId,
        UpdateItemPositionRequest request,
        [CurrentUser] User user,
        CancellationToken cancellationToken)
    {
        var result = await _itemService.ReorderAsync(user.Id, listId, itemId, request.PrecedingItemId, cancellationToken);
        return result.Status switch
        {
            ReorderStatus.Success => ToResponse(result.Value!),
            ReorderStatus.NotFound => NotFound(),
            ReorderStatus.PrecedingNotFound => Problem(
                detail: "The preceding item could not be found in this list.",
                statusCode: StatusCodes.Status400BadRequest),
            ReorderStatus.SamePreceding => Problem(
                detail: "An item cannot be positioned after itself.",
                statusCode: StatusCodes.Status400BadRequest),
            _ => StatusCode(StatusCodes.Status500InternalServerError),
        };
    }

    [HttpDelete("{itemId:guid}")]
    public async Task<IActionResult> Delete(
        Guid listId,
        Guid itemId,
        [CurrentUser] User user,
        CancellationToken cancellationToken)
    {
        var deleted = await _itemService.SoftDeleteAsync(user.Id, listId, itemId, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    private static ItemResponse ToResponse(TodoItem item) => new(
        item.Id,
        item.ListId,
        item.Title,
        item.Description,
        item.SortOrder,
        item.CompletedAt is not null,
        item.CreatedAt,
        item.UpdatedAt);
}
