import { useCallback, useEffect } from 'react';

import type { components } from '../../api/schema';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { UnauthorizedError, useApi } from '../auth/useApi';
import type { ListEntity } from './listsSlice';
import {
  listAdded,
  listDeleted,
  listsError,
  listsLoaded,
  listsLoading,
  listsReorderedLocal,
  listUpdated,
} from './listsSlice';

type CreateListRequest = components['schemas']['CreateListRequest'];
type UpdateListRequest = components['schemas']['UpdateListRequest'];
type UpdateListPositionRequest =
  components['schemas']['UpdateListPositionRequest'];

export function useLists() {
  const api = useApi();
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.lists);

  useEffect(() => {
    let cancelled = false;
    dispatch(listsLoading());
    api('/lists')
      .then(async (r) => {
        if (!r.ok)
          throw new Error(`/lists failed: ${r.status} ${r.statusText}`);
        return (await r.json()) as ListEntity[];
      })
      .then((lists) => {
        if (cancelled) return;
        dispatch(listsLoaded(lists));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof UnauthorizedError) return;
        dispatch(listsError(err instanceof Error ? err.message : String(err)));
      });
    return () => {
      cancelled = true;
    };
  }, [api, dispatch]);

  const createList = useCallback(
    async (name: string) => {
      const body: CreateListRequest = { name };
      const r = await api('/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(`Create failed: ${r.status} ${r.statusText}`);
      const created = (await r.json()) as ListEntity;
      dispatch(listAdded(created));
      return created;
    },
    [api, dispatch],
  );

  const updateList = useCallback(
    async (id: string, name: string) => {
      const body: UpdateListRequest = { name };
      const r = await api(`/lists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(`Update failed: ${r.status} ${r.statusText}`);
      const updated = (await r.json()) as ListEntity;
      dispatch(listUpdated(updated));
      return updated;
    },
    [api, dispatch],
  );

  const deleteList = useCallback(
    async (id: string) => {
      const r = await api(`/lists/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error(`Delete failed: ${r.status} ${r.statusText}`);
      dispatch(listDeleted(id));
    },
    [api, dispatch],
  );

  const reorderList = useCallback(
    async (orderedIds: string[], movedId: string) => {
      // Apply locally first; the server will normalize sortOrder fields.
      dispatch(listsReorderedLocal(orderedIds));
      const movedIdx = orderedIds.indexOf(movedId);
      const precedingListId = movedIdx > 0 ? orderedIds[movedIdx - 1] : null;
      const body: UpdateListPositionRequest = { precedingListId };
      const r = await api(`/lists/${movedId}/position`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(`Reorder failed: ${r.status} ${r.statusText}`);
      const updated = (await r.json()) as ListEntity;
      dispatch(listUpdated(updated));
    },
    [api, dispatch],
  );

  return { state, createList, updateList, deleteList, reorderList };
}
