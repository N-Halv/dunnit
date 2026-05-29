import { configureStore } from '@reduxjs/toolkit';

import { itemsReducer } from '../features/lists/itemsSlice';
import { listsReducer } from '../features/lists/listsSlice';
import { userReducer } from '../features/user/userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    lists: listsReducer,
    items: itemsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
