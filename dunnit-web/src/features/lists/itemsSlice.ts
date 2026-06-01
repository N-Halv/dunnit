import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { components } from '../../api/schema';
import { sortBySortOrder } from './sortOrder';

export type ItemEntity = components['schemas']['ItemResponse'];

export type ItemsForList =
  | { status: 'idle'; items: []; error: null }
  | { status: 'loading'; items: []; error: null }
  | { status: 'loaded'; items: ItemEntity[]; error: null }
  | { status: 'error'; items: []; error: string };

export type ItemsState = {
  byList: Record<string, ItemsForList>;
};

const initialState: ItemsState = { byList: {} };

const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    itemsLoading(state, action: PayloadAction<string>) {
      state.byList[action.payload] = {
        status: 'loading',
        items: [],
        error: null,
      };
    },
    itemsLoaded(
      state,
      action: PayloadAction<{ listId: string; items: ItemEntity[] }>,
    ) {
      state.byList[action.payload.listId] = {
        status: 'loaded',
        items: sortBySortOrder(action.payload.items),
        error: null,
      };
    },
    itemsError(
      state,
      action: PayloadAction<{ listId: string; error: string }>,
    ) {
      state.byList[action.payload.listId] = {
        status: 'error',
        items: [],
        error: action.payload.error,
      };
    },
    itemAdded(state, action: PayloadAction<ItemEntity>) {
      const slot = state.byList[action.payload.listId];
      if (!slot || slot.status !== 'loaded') return;
      slot.items.push(action.payload);
      slot.items = sortBySortOrder(slot.items);
    },
    itemUpdated(state, action: PayloadAction<ItemEntity>) {
      const slot = state.byList[action.payload.listId];
      if (!slot || slot.status !== 'loaded') return;
      const idx = slot.items.findIndex((i) => i.id === action.payload.id);
      if (idx >= 0) {
        slot.items[idx] = action.payload;
        slot.items = sortBySortOrder(slot.items);
      }
    },
    itemDeleted(
      state,
      action: PayloadAction<{ listId: string; itemId: string }>,
    ) {
      const slot = state.byList[action.payload.listId];
      if (!slot || slot.status !== 'loaded') return;
      slot.items = slot.items.filter((i) => i.id !== action.payload.itemId);
    },
    // Used by drag-and-drop to apply an optimistic reorder before the API call resolves.
    itemsReorderedLocal(
      state,
      action: PayloadAction<{ listId: string; orderedIds: string[] }>,
    ) {
      const slot = state.byList[action.payload.listId];
      if (!slot || slot.status !== 'loaded') return;
      const byId = new Map(slot.items.map((i) => [i.id, i]));
      slot.items = action.payload.orderedIds
        .map((id) => byId.get(id))
        .filter((i): i is ItemEntity => i !== undefined);
    },
  },
});

export const {
  itemsLoading,
  itemsLoaded,
  itemsError,
  itemAdded,
  itemUpdated,
  itemDeleted,
  itemsReorderedLocal,
} = itemsSlice.actions;

export const itemsReducer = itemsSlice.reducer;
