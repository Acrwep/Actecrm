import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu } from "antd";
import { UserOutlined, VideoCameraOutlined } from "@ant-design/icons";

export default function SideMenu() {
  const navigate = useNavigate();
  const location = useLocation("");

  const [selectedKey, setSelectedKey] = useState("");
  const sideMenuOptions = {
    1: {
      title: "Dashboard",
      icon: <UserOutlined />,
      path: "dashboard",
    },
    2: {
      title: "Lead Manager",
      icon: <VideoCameraOutlined />,
      path: "lead-manager",
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
