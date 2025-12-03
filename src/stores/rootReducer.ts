import { combineReducers } from "@reduxjs/toolkit";
import { type TypedUseSelectorHook, useSelector } from "react-redux";
import { gameServerSliceReducer } from "@/stores/slices/gameServerSlice.ts";
import type { RootState } from ".";

const appReducer = combineReducers({
  gameServerSliceReducer,
});

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export default appReducer;
