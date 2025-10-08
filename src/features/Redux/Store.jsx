import { configureStore } from "@reduxjs/toolkit";
import {
  groupListReducer,
  nxtFollowupActionIdReducer,
  roleListReducer,
  usersListReducer,
  allUsersListReducer,
  permissionsListReducer,
  leadsModulePermissionListReducer,
  leadFollowupModulePermissionListReducer,
  customersModulePermissionListReducer,
  feesPendingModulePermissionListReducer,
  trainersModulePermissionListReducer,
  settingsModulePermissionListReducer,
  childUsersReducer,
  userPermissionsReducer,
} from "./Slice";

export const reduxStore = configureStore({
  devTools: true,
  reducer: {
    userslist: usersListReducer,
    alluserslist: allUsersListReducer,
    nxtfollowupactionid: nxtFollowupActionIdReducer,
    grouplist: groupListReducer,
    rolelist: roleListReducer,
    childusers: childUsersReducer,
    userpermissions: userPermissionsReducer,
    permissionslist: permissionsListReducer,
    leadsmodulepermissionlist: leadsModulePermissionListReducer,
    leadfollowupmodulepermissionlist: leadFollowupModulePermissionListReducer,
    customersmodulepermissionlist: customersModulePermissionListReducer,
    feespendingmodulepermissionlist: feesPendingModulePermissionListReducer,
    trainersmodulepermissionlist: trainersModulePermissionListReducer,
    settingsmodulepermissionlist: settingsModulePermissionListReducer,
  },
});
