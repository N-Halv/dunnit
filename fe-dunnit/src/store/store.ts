import { configureStore } from '@reduxjs/toolkit'
import { userReducer } from '../features/user/userSlice'
import { listsReducer } from '../features/lists/listsSlice'
import { itemsReducer } from '../features/lists/itemsSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    lists: listsReducer,
    items: itemsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
