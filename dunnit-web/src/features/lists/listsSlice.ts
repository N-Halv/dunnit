import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { components } from '../../api/schema';
import { sortBySortOrder } from './sortOrder';

export type ListEntity = components['schemas']['ListResponse'];

export type ListsState =
  | { status: 'idle'; lists: []; error: null }
  | { status: 'loading'; lists: []; error: null }
  | { status: 'loaded'; lists: ListEntity[]; error: null }
  | { status: 'error'; lists: []; error: string };

const initialState: ListsState = { status: 'idle', lists: [], error: null };

const listsSlice = createSlice({
  name: 'lists',
  initialState: initialState as ListsState,
  reducers: {
    listsLoading(): ListsState {
      return { status: 'loading', lists: [], error: null };
    },
    listsLoaded(_state, action: PayloadAction<ListEntity[]>): ListsState {
      return {
        status: 'loaded',
        lists: sortBySortOrder(action.payload),
        error: null,
      };
    },
    listsError(_state, action: PayloadAction<string>): ListsState {
      return { status: 'error', lists: [], error: action.payload };
    },
    listAdded(state, action: PayloadAction<ListEntity>) {
      if (state.status !== 'loaded') return;
      state.lists.push(action.payload);
      state.lists = sortBySortOrder(state.lists);
    },
    listUpdated(state, action: PayloadAction<ListEntity>) {
      if (state.status !== 'loaded') return;
      const idx = state.lists.findIndex((l) => l.id === action.payload.id);
      if (idx >= 0) {
        state.lists[idx] = action.payload;
        state.lists = sortBySortOrder(state.lists);
      }
    },
    listDeleted(state, action: PayloadAction<string>) {
      if (state.status !== 'loaded') return;
      state.lists = state.lists.filter((l) => l.id !== action.payload);
    },
    // Used by drag-and-drop to apply an optimistic reorder before the API call resolves.
    listsReorderedLocal(state, action: PayloadAction<string[]>) {
      if (state.status !== 'loaded') return;
      const byId = new Map(state.lists.map((l) => [l.id, l]));
      state.lists = action.payload
        .map((id) => byId.get(id))
        .filter((l): l is ListEntity => l !== undefined);
    },
  },
});

export const {
  listsLoading,
  listsLoaded,
  listsError,
  listAdded,
  listUpdated,
  listDeleted,
  listsReorderedLocal,
} = listsSlice.actions;

export const listsReducer = listsSlice.reducer;
