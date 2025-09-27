import { configureStore } from "@reduxjs/toolkit";
import {
  groupListReducer,
  nxtFollowupActionIdReducer,
  roleListReducer,
  usersListReducer,
} from "./Slice";

export const reduxStore = configureStore({
  devTools: true,
  reducer: {
    userslist: usersListReducer,
    nxtfollowupactionid: nxtFollowupActionIdReducer,
    grouplist: groupListReducer,
    rolelist: roleListReducer,
  },
});
