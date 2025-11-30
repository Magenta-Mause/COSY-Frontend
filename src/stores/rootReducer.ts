import { combineReducers } from "@reduxjs/toolkit";
import { type TypedUseSelectorHook, useSelector } from "react-redux";
import { gameServerConfigurationSliceReducer } from "@/stores/slices/gameServerConfigurationSlice.ts";
import type { RootState } from ".";

const appReducer = combineReducers({
  gameServerConfigurationSliceReducer,
});

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export default appReducer;
