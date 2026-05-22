import { combineReducers } from "@reduxjs/toolkit";
import { type TypedUseSelectorHook, useSelector } from "react-redux";
import { gameServerLogSliceReducer } from "@/stores/slices/gameServerLogSlice.ts";
import { gameServerPermissionsSliceReducer } from "@/stores/slices/gameServerPermissionsSlice.ts";
import { gameServerSliceReducer } from "@/stores/slices/gameServerSlice.ts";
import { gameSliceReducer } from "@/stores/slices/gameSlice.ts";
import { templateSliceReducer } from "@/stores/slices/templateSlice.ts";
import { userInviteSliceReducer } from "@/stores/slices/userInviteSlice.ts";
import { userSliceReducer } from "@/stores/slices/userSlice.ts";
import type { RootState } from ".";
import { gameServerMetricsSliceReducer } from "./slices/gameServerMetrics";

const appReducer = combineReducers({
  gameServerSliceReducer,
  userInviteSliceReducer,
  gameServerPermissionsSliceReducer,
  gameServerLogSliceReducer,
  gameServerMetricsSliceReducer,
  userSliceReducer,
  templateSliceReducer,
  gameSliceReducer,
});

export const RESET_STORE = "RESET_STORE";

const rootReducer: typeof appReducer = (state, action) => {
  if (action.type === RESET_STORE) {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export default rootReducer;
