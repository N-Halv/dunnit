import { useCallback, useEffect } from 'react'
import { useApi, UnauthorizedError } from '../auth/useApi'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  itemAdded,
  itemDeleted,
  itemUpdated,
  itemsError,
  itemsLoaded,
  itemsLoading,
  itemsReorderedLocal,
} from './itemsSlice'
import type { ItemEntity, ItemsForList } from './itemsSlice'
import type { components } from '../../api/schema'

type CreateItemRequest = components['schemas']['CreateItemRequest']
type UpdateItemRequest = components['schemas']['UpdateItemRequest']
type UpdateItemPositionRequest =
  components['schemas']['UpdateItemPositionRequest']

// Stable reference so the selector doesn't return a new object each render
// when the list hasn't been fetched yet.
const idleSlot: ItemsForList = { status: 'idle', items: [], error: null }

export function useItems(listId: string | undefined) {
  const api = useApi()
  const dispatch = useAppDispatch()
  const state = useAppSelector((s) =>
    listId ? (s.items.byList[listId] ?? idleSlot) : idleSlot,
  )

  useEffect(() => {
    if (!listId) return
    let cancelled = false
    dispatch(itemsLoading(listId))
    api(`/lists/${listId}/items`)
      .then(async (r) => {
        if (!r.ok)
          throw new Error(
            `/lists/${listId}/items failed: ${r.status} ${r.statusText}`,
          )
        return (await r.json()) as ItemEntity[]
      })
      .then((items) => {
        if (cancelled) return
        dispatch(itemsLoaded({ listId, items }))
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (err instanceof UnauthorizedError) return
        dispatch(
          itemsError({
            listId,
            error: err instanceof Error ? err.message : String(err),
          }),
        )
      })
    return () => {
      cancelled = true
    }
  }, [api, dispatch, listId])

  const createItem = useCallback(
    async (title: string) => {
      if (!listId) throw new Error('No list selected')
      const body: CreateItemRequest = { title, description: null }
      const r = await api(`/lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!r.ok) throw new Error(`Create failed: ${r.status} ${r.statusText}`)
      const created = (await r.json()) as ItemEntity
      dispatch(itemAdded(created))
      return created
    },
    [api, dispatch, listId],
  )

  const updateItem = useCallback(
    async (itemId: string, body: UpdateItemRequest) => {
      if (!listId) throw new Error('No list selected')
      const r = await api(`/lists/${listId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!r.ok) throw new Error(`Update failed: ${r.status} ${r.statusText}`)
      const updated = (await r.json()) as ItemEntity
      dispatch(itemUpdated(updated))
      return updated
    },
    [api, dispatch, listId],
  )

  const deleteItem = useCallback(
    async (itemId: string) => {
      if (!listId) throw new Error('No list selected')
      const r = await api(`/lists/${listId}/items/${itemId}`, {
        method: 'DELETE',
      })
      if (!r.ok) throw new Error(`Delete failed: ${r.status} ${r.statusText}`)
      dispatch(itemDeleted({ listId, itemId }))
    },
    [api, dispatch, listId],
  )

  const reorderItem = useCallback(
    async (orderedIds: string[], movedId: string) => {
      if (!listId) throw new Error('No list selected')
      dispatch(itemsReorderedLocal({ listId, orderedIds }))
      const movedIdx = orderedIds.indexOf(movedId)
      const precedingItemId = movedIdx > 0 ? orderedIds[movedIdx - 1] : null
      const body: UpdateItemPositionRequest = { precedingItemId }
      const r = await api(`/lists/${listId}/items/${movedId}/position`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!r.ok) throw new Error(`Reorder failed: ${r.status} ${r.statusText}`)
      const updated = (await r.json()) as ItemEntity
      dispatch(itemUpdated(updated))
    },
    [api, dispatch, listId],
  )

  return { state, createItem, updateItem, deleteItem, reorderItem }
}
