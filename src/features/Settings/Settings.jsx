import React, { useState, useEffect } from "react";
import "./styles.css";
import Users from "./Users";
import PageAccess from "./PageAccess";
import { useDispatch } from "react-redux";
import { getUsers } from "../ApiService/action";
import { storeUsersList } from "../Redux/Slice";

export default function Settings() {
  const dispatch = useDispatch();
  const [activePage, setActivePage] = useState("users");
  const [userTableLoading, setUserTableLoading] = useState(true);

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
        <PageAccess />
      ) : (
        ""
      )}
    </div>
  );
}
