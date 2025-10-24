import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  storeBulkSearchModulePermissionList,
  storeCustomersModulePermissionList,
  storeDashboardModulePermissionList,
  storeFeesPendingModulePermissionList,
  storeGroupList,
  storeLeadFollowupModulePermissionList,
  storeLeadsModulePermissionList,
  storePermissionsList,
  storeRoleList,
  storeRoleSearchValue,
  storeSettingsModulePermissionList,
  storeTrainersModulePermissionList,
  storeUserSearchValue,
  storeUsersList,
} from "../Redux/Slice";
import { useSelector } from "react-redux";

export default function Settings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("users");
  const [userTableLoading, setUserTableLoading] = useState(true);
  const [groupLoading, setGroupLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);
  //permissions
  const permissions = useSelector((state) => state.userpermissions);

  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    dispatch(storeUserSearchValue(null));
    dispatch(storeRoleSearchValue(null));
    if (permissions.length >= 1) {
      if (!permissions.includes("Settings Page")) {
        navigate("/dashboard");
        return;
      }
      getUsersData();
    }
  }, [permissions]);

  const getUsersData = async () => {
    setUserTableLoading(true);
    const payload = {
      page: 1,
      limit: 10,
    };
    try {
      const response = await getUsers(payload);
      console.log("users response", response);
      dispatch(storeUsersList(response?.data?.data?.data || []));
      const pagination = response?.data?.data?.pagination;
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      });
    } catch (error) {
      dispatch(storeUsersList([]));
      dispatch(storeAllUsersList([]));
    } finally {
      setTimeout(() => {
        setUserTableLoading(false);
        getAllUsersData();
      }, 300);
    }
  };

  const getAllUsersData = async () => {
    const payload = {
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getUsers(payload);
      console.log("all usersss", response);
      dispatch(storeAllUsersList(response?.data?.data?.data || []));
    } catch (error) {
      dispatch(storeAllUsersList([]));
      console.log(error);
    } finally {
      setTimeout(() => {
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
      //filter dashboard module
      const dashboardModule = allPermissions.filter(
        (f) => f.section === "Dashboard Module"
      );
      const dashboardCustomOrder = [
        "Score Board",
        "Sale Performance",
        "Top Performing Channels",
        "HR Dashboard",
        "RA Dashboard",
      ];

      const dashboardSortedArray = dashboardModule.sort(
        (a, b) =>
          dashboardCustomOrder.indexOf(a.permission_name) -
          dashboardCustomOrder.indexOf(b.permission_name)
      );

      const updateDashboardModule = dashboardSortedArray.map((u) => {
        return { ...u, checked: false };
      });

      dispatch(storeDashboardModulePermissionList(updateDashboardModule));

      //filter lead module
      const leadsModule = allPermissions.filter(
        (f) => f.section === "Leads Module"
      );
      const leadsCustomOrder = [
        "Lead Manager Page",
        "Add Lead Button",
        "Edit Lead Button",
        "Assign Lead",
        "Lead Executive Filter",
      ];

      const leadsSortedArray = leadsModule.sort(
        (a, b) =>
          leadsCustomOrder.indexOf(a.permission_name) -
          leadsCustomOrder.indexOf(b.permission_name)
      );

      const updateLeadsModule = leadsSortedArray.map((u) => {
        return { ...u, checked: false };
      });

      dispatch(storeLeadsModulePermissionList(updateLeadsModule));

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
      const customersCustomOrder = [
        "Update Customer",
        "Update Payment",
        "Update Payment Master",
        "Finance Verify",
        "Student Verify",
        "Trainer Assign",
        "Trainer Verify",
        "Class Schedule",
        "Update Class Going",
        "Passedout Process",
      ];

      const customersSortedArray = customersModule.sort(
        (a, b) =>
          customersCustomOrder.indexOf(a.permission_name) -
          customersCustomOrder.indexOf(b.permission_name)
      );

      const updateCustomersModule = customersSortedArray.map((u) => {
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

      //filter bulk search module
      const bulkSearchModule = allPermissions.filter(
        (f) => f.section === "Bulk Search"
      );
      const bulkSearchCustomOrder = ["Bulk Search Page", "Download Access"];

      const bulkSearchSortedArray = bulkSearchModule.sort(
        (a, b) =>
          bulkSearchCustomOrder.indexOf(a.permission_name) -
          bulkSearchCustomOrder.indexOf(b.permission_name)
      );

      const updateBulkSearchModule = bulkSearchSortedArray.map((u) => {
        return { ...u, checked: false };
      });
      dispatch(storeBulkSearchModulePermissionList(updateBulkSearchModule));

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
        "Add Permissions",
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
          pagination={pagination}
          setPagination={setPagination}
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
