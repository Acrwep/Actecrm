import { configureStore } from "@reduxjs/toolkit";
import {
  groupListReducer,
  nxtFollowupActionIdReducer,
  roleListReducer,
  usersListReducer,
  permissionsListReducer,
  leadsModulePermissionListReducer,
  customersModulePermissionListReducer,
  trainersModulePermissionListReducer,
  settingsModulePermissionListReducer,
} from "./Slice";

export const reduxStore = configureStore({
  devTools: true,
  reducer: {
    userslist: usersListReducer,
    nxtfollowupactionid: nxtFollowupActionIdReducer,
    grouplist: groupListReducer,
    rolelist: roleListReducer,
    permissionslist: permissionsListReducer,
    leadsmodulepermissionlist: leadsModulePermissionListReducer,
    customersmodulepermissionlist: customersModulePermissionListReducer,
    trainersmodulepermissionlist: trainersModulePermissionListReducer,
    settingsmodulepermissionlist: settingsModulePermissionListReducer,
  },
});
