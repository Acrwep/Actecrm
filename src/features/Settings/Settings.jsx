import React, { useState, useEffect } from "react";
import "./styles.css";
import Users from "./Users";
import PageAccess from "./PageAccess";
import { useDispatch } from "react-redux";
import { getGroups, getRoles, getUsers } from "../ApiService/action";
import { storeGroupList, storeRoleList, storeUsersList } from "../Redux/Slice";

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
    } catch (error) {
      dispatch(storeUsersList([]));
    } finally {
      setTimeout(() => {
        setUserTableLoading(false);
        getGroupsData();
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
      }, 300);
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
