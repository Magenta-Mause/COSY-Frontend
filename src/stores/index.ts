import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";

export interface SliceState<T> {
  data: T[];
  state: "idle" | "loading" | "failed";
}

const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
