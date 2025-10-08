import React, { useState, useEffect } from "react";
import "./styles.css";
import Users from "./Users";
import PageAccess from "./PageAccess";
import { useDispatch } from "react-redux";
import {
  getAllPermissions,
  getGroups,
  getRoles,
  getUsers,
} from "../ApiService/action";
import {
  storeAllUsersList,
  storeCustomersModulePermissionList,
  storeFeesPendingModulePermissionList,
  storeGroupList,
  storeLeadFollowupModulePermissionList,
  storeLeadsModulePermissionList,
  storePermissionsList,
  storeRoleList,
  storeSettingsModulePermissionList,
  storeTrainersModulePermissionList,
  storeUsersList,
} from "../Redux/Slice";

export default function Settings() {
  const dispatch = useDispatch();
  const [activePage, setActivePage] = useState("users");
  const [userTableLoading, setUserTableLoading] = useState(true);
  const [groupLoading, setGroupLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    getUsersData();
  }, []);

  const getUsersData = async () => {
    setUserTableLoading(true);
    try {
      const response = await getUsers();
      console.log("users response", response);
      dispatch(storeUsersList(response?.data?.data || []));
      dispatch(storeAllUsersList(response?.data?.data || []));
    } catch (error) {
      dispatch(storeUsersList([]));
      dispatch(storeAllUsersList([]));
    } finally {
      setTimeout(() => {
        setUserTableLoading(false);
        getRolesData();
      }, 300);
    }
  };

  const getGroupsData = async () => {
    try {
      const response = await getGroups();
      console.log("groups response", response);
      dispatch(storeGroupList(response?.data?.data || []));
    } catch (error) {
      dispatch(storeGroupList([]));
      console.log("group error", error);
    } finally {
      setTimeout(() => {
        setGroupLoading(false);
        getRolesData();
      }, 300);
    }
  };

  const getRolesData = async () => {
    try {
      const response = await getRoles();
      console.log("roles response", response);
      dispatch(storeRoleList(response?.data?.data || []));
    } catch (error) {
      dispatch(storeRoleList([]));
      console.log("roles error", error);
    } finally {
      setTimeout(() => {
        setRoleLoading(false);
        getPermissionsData();
      }, 300);
    }
  };

  const getPermissionsData = async () => {
    try {
      const response = await getAllPermissions();
      console.log("all permissions response", response);
      const allPermissions = response?.data?.data || [];
      dispatch(storePermissionsList(allPermissions));
      //filter lead module
      const leadsModule = allPermissions.filter(
        (f) => f.section === "Leads Module"
      );
      const leadsCustomOrder = [
        "Lead Manager Page",
        "Add Lead Button",
        "Edit Lead Button",
        "Assign Lead",
      ];

      const leadsSortedArray = leadsModule.sort(
        (a, b) =>
          leadsCustomOrder.indexOf(a.permission_name) -
          leadsCustomOrder.indexOf(b.permission_name)
      );

      const updateLeadssModule = leadsSortedArray.map((u) => {
        return { ...u, checked: false };
      });

      dispatch(storeLeadsModulePermissionList(updateLeadssModule));

      //filter lead followup module
      const leadsFollowupModule = allPermissions.filter(
        (f) => f.section === "Lead Followup Module"
      );
      const updateLeadFollowupModule = leadsFollowupModule.map((u) => {
        return { ...u, checked: false };
      });
      dispatch(storeLeadFollowupModulePermissionList(updateLeadFollowupModule));

      //filter customers module
      const customersModule = allPermissions.filter(
        (f) => f.section === "Customers Module"
      );
      const updateCustomersModule = customersModule.map((u) => {
        return { ...u, checked: false };
      });
      dispatch(storeCustomersModulePermissionList(updateCustomersModule));

      //filter fees pending module
      const feesPendingModule = allPermissions.filter(
        (f) => f.section === "Fees Pending Module"
      );
      const updateFeesPendingModule = feesPendingModule.map((u) => {
        return { ...u, checked: false };
      });
      dispatch(storeFeesPendingModulePermissionList(updateFeesPendingModule));

      //filter trainers module
      const trainersModule = allPermissions.filter(
        (f) => f.section === "Trainers Module"
      );
      const updateTrainersModule = trainersModule.map((u) => {
        return { ...u, checked: false };
      });
      dispatch(storeTrainersModulePermissionList(updateTrainersModule));

      //filter settings module
      const settingsModule = allPermissions.filter(
        (f) => f.section === "Settings Module"
      );
      // Define the custom order
      const customOrder = [
        "Settings Page",
        "Add User",
        "Update User",
        "Delete User",
        "Add Role",
        "Update Role",
        "Delete Role",
        "Add Permission",
      ];

      const sortedArray = settingsModule.sort(
        (a, b) =>
          customOrder.indexOf(a.permission_name) -
          customOrder.indexOf(b.permission_name)
      );

      const updateSettingsModule = sortedArray.map((u) => {
        return { ...u, checked: false };
      });
      dispatch(storeSettingsModulePermissionList(updateSettingsModule));
    } catch (error) {
      dispatch(storePermissionsList([]));
      console.log("all permissions error", error);
    }
  };

  return (
    <div>
      <div className="settings_tabbutton_maincontainer">
        <div style={{ display: "flex", gap: "18px" }}>
          <button
            className={
              activePage === "users"
                ? "settings_tab_activebutton"
                : "settings_tab_inactivebutton"
            }
            onClick={() => setActivePage("users")}
          >
            Users
          </button>
          {/* <button
          className={
            activePage === "addfields"
              ? "settings_tab_activebutton"
              : "settings_tab_inactivebutton"
          }
          onClick={() => setActivePage("addfields")}
        >
          Add fields
        </button> */}
          <button
            className={
              activePage === "pageaccess"
                ? "settings_tab_activebutton"
                : "settings_tab_inactivebutton"
            }
            onClick={() => setActivePage("pageaccess")}
          >
            Page Access
          </button>
        </div>
      </div>

      {activePage === "users" ? (
        <Users
          userTableLoading={userTableLoading}
          setUserTableLoading={setUserTableLoading}
        />
      ) : activePage === "pageaccess" ? (
        <PageAccess
          groupLoading={groupLoading}
          setGroupLoading={setGroupLoading}
          roleLoading={roleLoading}
          setRoleLoading={setRoleLoading}
        />
      ) : (
        ""
      )}
    </div>
  );
}
