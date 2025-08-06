import { configureStore } from "@reduxjs/toolkit";
import { usersListReducer } from "./Slice";

export const reduxStore = configureStore({
  devTools: true,
  reducer: {
    userslist: usersListReducer,
  },
});
