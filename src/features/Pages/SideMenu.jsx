import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu } from "antd";
import { GrAppsRounded } from "react-icons/gr";
import { PiUsersThreeBold } from "react-icons/pi";
import { FiPhoneCall } from "react-icons/fi";
import { PiHandCoins } from "react-icons/pi";

export default function SideMenu() {
  const navigate = useNavigate();
  const location = useLocation("");

  const [selectedKey, setSelectedKey] = useState("");
  const sideMenuOptions = {
    1: {
      title: "Dashboard",
      icon: <GrAppsRounded size={17} />,
      path: "dashboard",
    },
    2: {
      title: "Lead Manager",
      icon: <PiHandCoins size={17} />,
      path: "lead-manager",
    },
    3: {
      title: "Lead Followup",
      icon: <FiPhoneCall size={17} />,
      path: "lead-followup",
    },
    4: {
      title: "Customers",
      icon: <PiUsersThreeBold size={17} />,
      path: "customers",
    },
  };

  useEffect(() => {
    const pathName = location.pathname.split("/")[1];
    setSelectedKey(pathName);
  }, [location.pathname]);

  const renderMenuItems = (menuConfig) => {
    return Object.entries(menuConfig).map(([key, item]) => {
      return {
        key: item.path,
        icon: item.icon,
        label: item.title,
      };
    });
  };

  const handleMenuClick = (e) => {
    navigate(`/${e.key}`);
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      items={renderMenuItems(sideMenuOptions)}
      onClick={handleMenuClick}
      style={{ backgroundColor: "rgb(91 105 202 / 0%)", borderRight: "none" }} // 👈 Add this
    />
  );
}
