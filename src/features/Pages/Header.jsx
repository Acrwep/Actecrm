import React from "react";
import { useLocation } from "react-router-dom";
import { LuMessageCircleMore } from "react-icons/lu";
import { IoMdNotificationsOutline } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { FcManager } from "react-icons/fc";
import "./styles.css";

export default function Header() {
  const location = useLocation();

  return (
    <div className="header_maincontainer">
      <div className="header_innercontainer">
        {/* left div */}
        <div className="header_titleContainer">
          <p className="header_pagetitle">
            {location.pathname === "/dashboard" ? "Dashboard" : "Lead Manager"}
          </p>
        </div>

        {/* right div */}
        <div style={{ display: "flex" }}>
          <div className="header_searchbar_container">
            <input className="header_searchbar" placeholder="Search" />
            <CiSearch className="header_searchbar_icon" />
          </div>

          <div className="header_profile_container">
            <div className="header_notificationicon_maincontainer">
              <div className="header_notificationicon_container">
                <LuMessageCircleMore size={16} />
              </div>
              <div className="header_notificationicon_container">
                <IoMdNotificationsOutline size={16} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div>
                <p className="header_nametext">Andrew Balaji R</p>
                <p className="header_roletext">Admin</p>
              </div>

              <div className="header_profileContainer">
                <FcManager size={32} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
