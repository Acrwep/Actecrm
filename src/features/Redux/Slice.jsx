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

const groupListSlice = createSlice({
  name: "grouplist",
  initialState,
  reducers: {
    storeGroupList(state, action) {
      state = action.payload;
      return state;
    },
  },
});

const roleListSlice = createSlice({
  name: "rolelist",
  initialState,
  reducers: {
    storeRoleList(state, action) {
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

const permissionsListSlice = createSlice({
  name: "permissionslist",
  initialState,
  reducers: {
    storePermissionsList(state, action) {
      state = action.payload;
      return state;
    },
  },
});

const leadsModulePermissionListSlice = createSlice({
  name: "leadsmodulepermissionlist",
  initialState,
  reducers: {
    storeLeadsModulePermissionList(state, action) {
      state = action.payload;
      return state;
    },
  },
});

const customersModulePermissionListSlice = createSlice({
  name: "customersmodulepermissionlist",
  initialState,
  reducers: {
    storeCustomersModulePermissionList(state, action) {
      state = action.payload;
      return state;
    },
  },
});

//define slice
export const { storeUsersList } = usersListSlice.actions;
export const { storeNxtFollowupActionId } = nxtFollowupActionIdSlice.actions;
export const { storeGroupList } = groupListSlice.actions;
export const { storeRoleList } = roleListSlice.actions;
export const { storePermissionsList } = permissionsListSlice.actions;
export const { storeLeadsModulePermissionList } =
  leadsModulePermissionListSlice.actions;
export const { storeCustomersModulePermissionList } =
  customersModulePermissionListSlice.actions;
//create reducer
export const usersListReducer = usersListSlice.reducer;
export const groupListReducer = groupListSlice.reducer;
export const roleListReducer = roleListSlice.reducer;
export const permissionsListReducer = permissionsListSlice.reducer;
export const leadsModulePermissionListReducer =
  leadsModulePermissionListSlice.reducer;
export const customersModulePermissionListReducer =
  customersModulePermissionListSlice.reducer;
export const nxtFollowupActionIdReducer = nxtFollowupActionIdSlice.reducer;
