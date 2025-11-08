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

const userSearchValue = null;
const userSearchValueSlice = createSlice({
  name: "usersearchvalue",
  initialState: userSearchValue,
  reducers: {
    storeUserSearchValue(state, action) {
      state = action.payload;
      return state;
    },
  },
});

const allUsersListSlice = createSlice({
  name: "alluserslist",
  initialState,
  reducers: {
    storeAllUsersList(state, action) {
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

const roleSearchValue = null;
const roleSearchValueSlice = createSlice({
  name: "rolesearchvalue",
  initialState: roleSearchValue,
  reducers: {
    storeRoleSearchValue(state, action) {
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

const dashboardModulePermissionListSlice = createSlice({
  name: "dashboardmodulepermissionlist",
  initialState,
  reducers: {
    storeDashboardModulePermissionList(state, action) {
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

const bulkSearchModulePermissionListSlice = createSlice({
  name: "bulksearchmodulepermissionlist",
  initialState,
  reducers: {
    storeBulkSearchModulePermissionList(state, action) {
      state = action.payload;
      return state;
    },
  },
});

const serverModulePermissionListSlice = createSlice({
  name: "servermodulepermissionlist",
  initialState,
  reducers: {
    storeServerModulePermissionList(state, action) {
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
      return [...action.payload]; // ensures new array reference
    },
  },
});

const downlineUsersSlice = createSlice({
  name: "downlineusers",
  initialState,
  reducers: {
    storeDownlineUsers(state, action) {
      return [...action.payload]; // ensures new array reference
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
//table columns
const tableColumnsSlice = createSlice({
  name: "tablecolumns",
  initialState,
  reducers: {
    storeTableColumns(state, action) {
      return [...action.payload]; // ensures new array reference
    },
  },
});

//define slice
export const { storeUserSearchValue } = userSearchValueSlice.actions;
export const { storeUsersList } = usersListSlice.actions;
export const { storeAllUsersList } = allUsersListSlice.actions;
export const { storeNxtFollowupActionId } = nxtFollowupActionIdSlice.actions;
export const { storeGroupList } = groupListSlice.actions;
export const { storeRoleList } = roleListSlice.actions;
export const { storeRoleSearchValue } = roleSearchValueSlice.actions;
export const { storePermissionsList } = permissionsListSlice.actions;
export const { storeDashboardModulePermissionList } =
  dashboardModulePermissionListSlice.actions;
export const { storeLeadsModulePermissionList } =
  leadsModulePermissionListSlice.actions;
export const { storeLeadFollowupModulePermissionList } =
  leadFollowupModulePermissionListSlice.actions;
export const { storeCustomersModulePermissionList } =
  customersModulePermissionListSlice.actions;
export const { storeFeesPendingModulePermissionList } =
  feesPendingModulePermissionListSlice.actions;
export const { storeBulkSearchModulePermissionList } =
  bulkSearchModulePermissionListSlice.actions;
export const { storeServerModulePermissionList } =
  serverModulePermissionListSlice.actions;
export const { storeTrainersModulePermissionList } =
  trainersModulePermissionListSlice.actions;
export const { storeSettingsModulePermissionList } =
  settingsModulePermissionListSlice.actions;
export const { storeChildUsers } = childUsersSlice.actions;
export const { storeDownlineUsers } = downlineUsersSlice.actions;
export const { storeUserPermissions } = userPermissionsSlice.actions;
export const { storeTableColumns } = tableColumnsSlice.actions;
//create reducer
export const usersListReducer = usersListSlice.reducer;
export const userSearchValueReducer = userSearchValueSlice.reducer;
export const allUsersListReducer = allUsersListSlice.reducer;
export const groupListReducer = groupListSlice.reducer;
export const roleListReducer = roleListSlice.reducer;
export const roleSearchValueReducer = roleSearchValueSlice.reducer;
export const permissionsListReducer = permissionsListSlice.reducer;
export const childUsersReducer = childUsersSlice.reducer;
export const downlineUsersReducer = downlineUsersSlice.reducer;
export const userPermissionsReducer = userPermissionsSlice.reducer;
export const dashboardModulePermissionListReducer =
  dashboardModulePermissionListSlice.reducer;
export const leadsModulePermissionListReducer =
  leadsModulePermissionListSlice.reducer;
export const leadFollowupModulePermissionListReducer =
  leadFollowupModulePermissionListSlice.reducer;
export const customersModulePermissionListReducer =
  customersModulePermissionListSlice.reducer;
export const feesPendingModulePermissionListReducer =
  feesPendingModulePermissionListSlice.reducer;
export const bulkSearchModulePermissionListReducer =
  bulkSearchModulePermissionListSlice.reducer;
export const serverModulePermissionListReducer =
  serverModulePermissionListSlice.reducer;
export const trainersModulePermissionListReducer =
  trainersModulePermissionListSlice.reducer;
export const settingsModulePermissionListReducer =
  settingsModulePermissionListSlice.reducer;
export const nxtFollowupActionIdReducer = nxtFollowupActionIdSlice.reducer;
export const tableColumnsReducer = tableColumnsSlice.reducer;
