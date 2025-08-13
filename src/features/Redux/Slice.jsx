import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const usersListSlice = createSlice({
  name: "userslist",
  initialState,
  reducers: {
    storeUsersList(state, action) {
      state = action.payload;
      return state;
    },
  },
});

const actionId = null;
const nxtFollowupActionIdSlice = createSlice({
  name: "nxtfollowupactionid",
  initialState: actionId,
  reducers: {
    storeNxtFollowupActionId(state, action) {
      state = action.payload;
      return state;
    },
  },
});

//define slice
export const { storeUsersList } = usersListSlice.actions;
export const { storeNxtFollowupActionId } = nxtFollowupActionIdSlice.actions;
//create reducer
export const usersListReducer = usersListSlice.reducer;
export const nxtFollowupActionIdReducer = nxtFollowupActionIdSlice.reducer;
