import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GameServerConfigurationEntity } from "@/api/generated/model";
import type { SliceState } from "@/stores";

const gameServerSlice = createSlice({
  name: "game-server-slice",
  initialState: {
    data: [],
    state: "idle",
  } as SliceState<GameServerConfigurationEntity>,
  reducers: {
    setGameServer: (state, action: PayloadAction<GameServerConfigurationEntity[]>) => {
      state.data = action.payload;
    },
    addGameServer: (state, action: PayloadAction<GameServerConfigurationEntity>) => {
      state.data.push(action.payload);
    },
    removeGameServer: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter(
        (gameServerConfiguration) => gameServerConfiguration.uuid !== action.payload,
      );
    },
    resetGameServers: (state) => {
      state.data = [];
    },
    setState: (state, action: PayloadAction<SliceState<null>["state"]>) => {
      state.state = action.payload;
    },
  },
});

export const gameServerSliceActions = gameServerSlice.actions;
export const gameServerSliceReducer = gameServerSlice.reducer;
