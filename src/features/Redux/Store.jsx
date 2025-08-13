import { configureStore } from "@reduxjs/toolkit";
import { nxtFollowupActionIdReducer, usersListReducer } from "./Slice";

export const reduxStore = configureStore({
  devTools: true,
  reducer: {
    userslist: usersListReducer,
    nxtfollowupactionid: nxtFollowupActionIdReducer,
  },
});
