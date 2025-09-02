import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LuMessageCircleMore } from "react-icons/lu";
import { IoMdNotificationsOutline } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { Button, Dropdown, Space } from "antd";
import { FcManager } from "react-icons/fc";
import { AiOutlineLogout } from "react-icons/ai";
import "./styles.css";

export default function CustomHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };
  const items = [
    {
      key: "1",
      label: (
        <div
          style={{ display: "flex", gap: "12px", alignItems: "center" }}
          onClick={handleLogout}
        >
          <AiOutlineLogout size={14} />
          <p>Logout</p>
        </div>
      ),
    },
  ];

  return (
    <div className="header_maincontainer">
      <div className="header_innercontainer">
        {/* left div */}
        <div className="header_titleContainer">
          <p className="header_pagetitle">
            {location.pathname === "/dashboard"
              ? "Dashboard"
              : location.pathname === "/lead-manager"
              ? "Lead Manager"
              : location.pathname === "/lead-followup"
              ? "Lead Followup"
              : location.pathname === "/customers"
              ? "Customers"
              : location.pathname === "/fee-pending-customers"
              ? "Fee Pending Customers"
              : location.pathname === "/batches"
              ? "Batches"
              : location.pathname === "/trainers"
              ? "Trainers"
              : location.pathname === "/server"
              ? "Server"
              : location.pathname === "/settings"
              ? "Settings"
              : ""}
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
                <Space direction="vertical">
                  <Space wrap>
                    <Dropdown
                      menu={{ items: items }}
                      placement="bottomLeft"
                      arrow={{ pointAtCenter: true }}
                      // popupRender={() => <CustomDropdownContent />}
                      trigger={["click"]}
                    >
                      <FcManager size={32} style={{ cursor: "pointer" }} />
                    </Dropdown>
                  </Space>
                </Space>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
