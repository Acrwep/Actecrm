import React, { useState } from "react";
import "./styles.css";
import Users from "./Users";
import PageAccess from "./PageAccess";

export default function Settings() {
  const [activePage, setActivePage] = useState("users");

  return (
    <div>
      <div className="settings_tabbutton_maincontainer">
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

      {activePage === "users" ? (
        <Users />
      ) : activePage === "pageaccess" ? (
        <PageAccess />
      ) : (
        ""
      )}
    </div>
  );
}
