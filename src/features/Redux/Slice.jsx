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

const leadFollowupModulePermissionListSlice = createSlice({
  name: "leadfollowupmodulepermissionlist",
  initialState,
  reducers: {
    storeLeadFollowupModulePermissionList(state, action) {
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

const feesPendingModulePermissionListSlice = createSlice({
  name: "feespendingmodulepermissionlist",
  initialState,
  reducers: {
    storeFeesPendingModulePermissionList(state, action) {
      state = action.payload;
      return state;
    },
  },
});

const trainersModulePermissionListSlice = createSlice({
  name: "trainersmodulepermissionlist",
  initialState,
  reducers: {
    storeTrainersModulePermissionList(state, action) {
      state = action.payload;
      return state;
    },
  },
});

const settingsModulePermissionListSlice = createSlice({
  name: "settingsmodulepermissionlist",
  initialState,
  reducers: {
    storeSettingsModulePermissionList(state, action) {
      state = action.payload;
      return state;
    },
  },
});

//permissions
const childUsersSlice = createSlice({
  name: "childusers",
  initialState,
  reducers: {
    storeChildUsers(state, action) {
      state = action.payload;
      return state;
    },
  },
});

const userPermissionsSlice = createSlice({
  name: "userpermissions",
  initialState,
  reducers: {
    storeUserPermissions(state, action) {
      return [...action.payload]; // ensures new array reference
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
export const { storeLeadFollowupModulePermissionList } =
  leadFollowupModulePermissionListSlice.actions;
export const { storeCustomersModulePermissionList } =
  customersModulePermissionListSlice.actions;
export const { storeFeesPendingModulePermissionList } =
  feesPendingModulePermissionListSlice.actions;
export const { storeTrainersModulePermissionList } =
  trainersModulePermissionListSlice.actions;
export const { storeSettingsModulePermissionList } =
  settingsModulePermissionListSlice.actions;
export const { storeChildUsers } = childUsersSlice.actions;
export const { storeUserPermissions } = userPermissionsSlice.actions;
//create reducer
export const usersListReducer = usersListSlice.reducer;
export const groupListReducer = groupListSlice.reducer;
export const roleListReducer = roleListSlice.reducer;
export const permissionsListReducer = permissionsListSlice.reducer;
export const childUsersReducer = childUsersSlice.reducer;
export const userPermissionsReducer = userPermissionsSlice.reducer;
export const leadsModulePermissionListReducer =
  leadsModulePermissionListSlice.reducer;
export const leadFollowupModulePermissionListReducer =
  leadFollowupModulePermissionListSlice.reducer;
export const customersModulePermissionListReducer =
  customersModulePermissionListSlice.reducer;
export const feesPendingModulePermissionListReducer =
  feesPendingModulePermissionListSlice.reducer;
export const trainersModulePermissionListReducer =
  trainersModulePermissionListSlice.reducer;
export const settingsModulePermissionListReducer =
  settingsModulePermissionListSlice.reducer;
export const nxtFollowupActionIdReducer = nxtFollowupActionIdSlice.reducer;
