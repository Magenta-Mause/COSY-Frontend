import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserEntityDto } from "@/api/generated/model";
import type { SliceState } from "@/stores";

const userSlice = createSlice({
  name: "user-slice",
  initialState: {
    data: [],
    state: "idle",
  } as SliceState<UserEntityDto>,
  reducers: {
    setUsers: (state, action: PayloadAction<UserEntityDto[]>) => {
      state.data = action.payload;
    },
    addUser: (state, action: PayloadAction<UserEntityDto>) => {
      state.data.push(action.payload);
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter((user) => user.uuid !== action.payload);
    },
    resetUsers: (state) => {
      state.data = [];
    },
    setState: (state, action: PayloadAction<SliceState<null>["state"]>) => {
      state.state = action.payload;
    },
  },
});

export const userSliceActions = userSlice.actions;
export const userSliceReducer = userSlice.reducer;
