using Dunnit.Api.Dtos;
using Dunnit.Api.ModelBinding;
using Dunnit.Api.Models;
using Dunnit.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Dunnit.Api.Controllers;

[ApiController]
[Route("lists")]
public class ListsController : ControllerBase
{
    private readonly IListService _listService;

    public ListsController(IListService listService)
    {
        _listService = listService;
    }

    [HttpGet]
    public async Task<IEnumerable<ListResponse>> Get(
        [CurrentUser] User user,
        CancellationToken cancellationToken)
    {
        var lists = await _listService.GetForUserAsync(user.Id, cancellationToken);
        return lists.Select(ToResponse);
    }

    [HttpPost]
    public async Task<ActionResult<ListResponse>> Create(
        CreateListRequest request,
        [CurrentUser] User user,
        CancellationToken cancellationToken)
    {
        var list = await _listService.CreateAsync(user.Id, request.Name, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = list.Id }, ToResponse(list));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ListResponse>> GetById(
        Guid id,
        [CurrentUser] User user,
        CancellationToken cancellationToken)
    {
        var list = await _listService.GetByIdAsync(user.Id, id, cancellationToken);
        if (list is null)
        {
            return NotFound();
        }
        return ToResponse(list);
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<ListResponse>> Update(
        Guid id,
        UpdateListRequest request,
        [CurrentUser] User user,
        CancellationToken cancellationToken)
    {
        var list = await _listService.UpdateAsync(user.Id, id, request.Name, cancellationToken);
        if (list is null)
        {
            return NotFound();
        }
        return ToResponse(list);
    }

    [HttpPatch("{id:guid}/position")]
    public async Task<ActionResult<ListResponse>> UpdatePosition(
        Guid id,
        UpdateListPositionRequest request,
        [CurrentUser] User user,
        CancellationToken cancellationToken)
    {
        var result = await _listService.ReorderAsync(user.Id, id, request.PrecedingListId, cancellationToken);
        return result.Status switch
        {
            ReorderStatus.Success => ToResponse(result.Value!),
            ReorderStatus.NotFound => NotFound(),
            ReorderStatus.PrecedingNotFound => Problem(
                detail: "The preceding list could not be found.",
                statusCode: StatusCodes.Status400BadRequest),
            ReorderStatus.SamePreceding => Problem(
                detail: "A list cannot be positioned after itself.",
                statusCode: StatusCodes.Status400BadRequest),
            _ => StatusCode(StatusCodes.Status500InternalServerError),
        };
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        Guid id,
        [CurrentUser] User user,
        CancellationToken cancellationToken)
    {
        var deleted = await _listService.SoftDeleteAsync(user.Id, id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    private static ListResponse ToResponse(TodoList list) => new(
        list.Id,
        list.CreatorUserId,
        list.Name,
        list.SortOrder,
        list.CreatedAt,
        list.UpdatedAt);
}
