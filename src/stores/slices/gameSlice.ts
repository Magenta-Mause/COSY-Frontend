import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GameDto } from "@/api/generated/model";
import type { SliceState } from "@/stores";

const gameSlice = createSlice({
  name: "game-slice",
  initialState: {
    data: [],
    state: "idle",
  } as SliceState<GameDto>,
  reducers: {
    setGames: (state, action: PayloadAction<GameDto[]>) => {
      state.data = action.payload;
    },
    setState: (state, action: PayloadAction<SliceState<null>["state"]>) => {
      state.state = action.payload;
    },
  },
});

export const gameSliceActions = gameSlice.actions;
export const gameSliceReducer = gameSlice.reducer;
