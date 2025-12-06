import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserInviteDto } from "@/api/generated/model";
import type { SliceState } from "@/stores";

const userInviteSlice = createSlice({
  name: "user-invite-slice",
  initialState: {
    data: [],
    state: "idle",
  } as SliceState<UserInviteDto>,
  reducers: {
    setInvites: (state, action: PayloadAction<UserInviteDto[]>) => {
      state.data = action.payload;
    },
    addInvite: (state, action: PayloadAction<UserInviteDto>) => {
      state.data.push(action.payload);
    },
    removeInvite: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter((user) => user.uuid !== action.payload);
    },
    resetInvites: (state) => {
      state.data = [];
    },
    setState: (state, action: PayloadAction<SliceState<null>["state"]>) => {
      state.state = action.payload;
    },
  },
});

export const userInviteSliceActions = userInviteSlice.actions;
export const userInviteSliceReducer = userInviteSlice.reducer;
