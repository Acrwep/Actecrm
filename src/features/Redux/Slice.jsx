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

//define slice
export const { storeUsersList } = usersListSlice.actions;

//create reducer
export const usersListReducer = usersListSlice.reducer;
