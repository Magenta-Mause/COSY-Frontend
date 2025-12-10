import { combineReducers } from "@reduxjs/toolkit";
import { type TypedUseSelectorHook, useSelector } from "react-redux";
import { gameServerSliceReducer } from "@/stores/slices/gameServerSlice.ts";
import { userInviteSliceReducer } from "@/stores/slices/userInviteSlice.ts";
import { userSliceReducer } from "@/stores/slices/userSlice.ts";
import type { RootState } from ".";

const appReducer = combineReducers({
  gameServerSliceReducer,
  userInviteSliceReducer,
  userSliceReducer,
});

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export default appReducer;
