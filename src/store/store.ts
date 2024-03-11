import { configureStore } from "@reduxjs/toolkit";
import { modalSlice } from "./slices/modalSlice";
import { api } from "@/api/api";

export const store = configureStore({
  reducer: {
    modals: modalSlice.reducer,
    // Other reducers...
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
