import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { components } from '../../api/schema'

export type User = components['schemas']['UserResponse']

export type UserState =
  | { status: 'idle'; user: null; error: null }
  | { status: 'loading'; user: null; error: null }
  | { status: 'loaded'; user: User; error: null }
  | { status: 'error'; user: null; error: string }

const initialState: UserState = { status: 'idle', user: null, error: null }

const userSlice = createSlice({
  name: 'user',
  initialState: initialState as UserState,
  reducers: {
    userLoading(): UserState {
      return { status: 'loading', user: null, error: null }
    },
    userLoaded(_state, action: PayloadAction<User>): UserState {
      return { status: 'loaded', user: action.payload, error: null }
    },
    userError(_state, action: PayloadAction<string>): UserState {
      return { status: 'error', user: null, error: action.payload }
    },
  },
})

export const { userLoading, userLoaded, userError } = userSlice.actions
export const userReducer = userSlice.reducer
