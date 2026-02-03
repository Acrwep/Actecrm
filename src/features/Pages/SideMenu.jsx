import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Menu } from "antd";
import { GrAppsRounded } from "react-icons/gr";
import { PiUsersThreeBold } from "react-icons/pi";
import { PiHandCoins } from "react-icons/pi";
import { MdOutlineGroupAdd } from "react-icons/md";
import { FaChalkboardTeacher } from "react-icons/fa";
import { IoServerOutline } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlinePendingActions } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { TbReport } from "react-icons/tb";
import { IoTicketOutline } from "react-icons/io5";
import {
  getTableColumns,
  getUserDownline,
  getUserPermissions,
} from "../ApiService/action";
import { useDispatch, useSelector } from "react-redux";
import {
  storeChildUsers,
  storeDownlineUsers,
  storeUserPermissions,
} from "../Redux/Slice";

export default function SideMenu() {
  const navigate = useNavigate();
  const location = useLocation("");
  const dispatch = useDispatch();
  const permissions = useSelector((state) => state.userpermissions);

  const [selectedKey, setSelectedKey] = useState("");
  const [sideMenuOptions, setSideMenuOptions] = useState({
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
      title: "Customers",
      icon: <PiUsersThreeBold size={17} />,
      path: "customers",
    },
    4: {
      title: "Batches",
      icon: <MdOutlineGroupAdd size={17} />,
      path: "batches",
    },
    5: {
      title: "Fee Pending",
      icon: <MdOutlinePendingActions size={17} />,
      path: "fee-pending-customers",
    },
    6: {
      title: "Server",
      icon: <IoServerOutline size={17} />,
      path: "server",
    },
    7: {
      title: "Trainers",
      icon: <FaChalkboardTeacher size={17} />,
      path: "trainers",
    },
    8: {
      title: "Trainer Payment",
      icon: <FaChalkboardTeacher size={17} />,
      path: "trainer-payment",
    },
    9: {
      title: "Bulk Search",
      icon: <IoSearch size={17} />,
      path: "bulk-search",
    },
    10: {
      title: "Reports",
      icon: <TbReport size={17} />,
      path: "reports",
    },
    11: {
      title: "Tickets",
      icon: <IoTicketOutline size={17} />,
      path: "tickets",
    },
    12: {
      title: "Settings",
      icon: <IoSettingsOutline size={17} />,
      path: "settings",
    },
  });

  const nonChangeMenuOptions = {
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
      title: "Customers",
      icon: <PiUsersThreeBold size={17} />,
      path: "customers",
    },
    4: {
      title: "Batches",
      icon: <MdOutlineGroupAdd size={17} />,
      path: "batches",
    },
    5: {
      title: "Fee Pending",
      icon: <MdOutlinePendingActions size={17} />,
      path: "fee-pending-customers",
    },
    6: {
      title: "Server",
      icon: <IoServerOutline size={17} />,
      path: "server",
    },
    7: {
      title: "Trainers",
      icon: <FaChalkboardTeacher size={17} />,
      path: "trainers",
    },
    8: {
      title: "Trainer Payment",
      icon: <FaChalkboardTeacher size={17} />,
      path: "trainer-payment",
    },
    9: {
      title: "Bulk Search",
      icon: <IoSearch size={17} />,
      path: "bulk-search",
    },
    10: {
      title: "Reports",
      icon: <TbReport size={17} />,
      path: "reports",
    },
    11: {
      title: "Tickets",
      icon: <IoTicketOutline size={17} />,
      path: "tickets",
    },
    12: {
      title: "Settings",
      icon: <IoSettingsOutline size={17} />,
      path: "settings",
    },
  };

  useEffect(() => {
    let updatedMenu = { ...nonChangeMenuOptions };

    // Remove Trainers if permission is not present
    if (!permissions.includes("Lead Manager Page")) {
      delete updatedMenu[2];
    }

    if (!permissions.includes("Trainers Page")) {
      delete updatedMenu[7];
    }

    if (!permissions.includes("Trainer Payment Page")) {
      delete updatedMenu[8];
    }

    if (!permissions.includes("Bulk Search Page")) {
      delete updatedMenu[9];
    }

    if (!permissions.includes("Reports Page")) {
      delete updatedMenu[10];
    }

    if (!permissions.includes("Settings Page")) {
      delete updatedMenu[12];
    }

    setSideMenuOptions(updatedMenu);
  }, [permissions]);

  useEffect(() => {
    const pathName = location.pathname.split("/")[1];
    setSelectedKey(pathName);
  }, [location.pathname]);

  useEffect(() => {
    getUserDownlineData();
  }, []);

  const getUserDownlineData = async () => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    let child_users;
    let downline_users;
    let user_roles;
    try {
      const response = await getUserDownline(convertAsJson?.user_id);
      console.log("user downline response", response);
      child_users = response?.data?.data?.child_users || [];
      downline_users = response?.data?.data?.downline_users || [];
      user_roles = response?.data?.data?.roles || [];
      dispatch(storeChildUsers(child_users));
      dispatch(storeDownlineUsers(downline_users));
    } catch (error) {
      user_roles = [];
      child_users = [];
      dispatch(storeChildUsers([]));
      dispatch(storeDownlineUsers([]));
      console.log("user downline error", error);
    } finally {
      setTimeout(() => {
        getPermissionsData(user_roles);
      }, 300);
    }
  };

  const getPermissionsData = async (user_roles) => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      role_ids: user_roles,
    };
    try {
      const response = await getUserPermissions(payload);
      console.log("user permissions response", response);
      const permission = response?.data?.data;
      if (permission.length >= 1) {
        const updateData = permission.map((item) => {
          return item.permission_name;
        });
        console.log("permissions", updateData);
        dispatch(storeUserPermissions(updateData));
        let updatedMenu = { ...nonChangeMenuOptions };

        if (!permissions.includes("Lead Manager Page")) {
          delete updatedMenu[2];
        }

        if (!updateData.includes("Trainers Page")) {
          delete updatedMenu[7];
        }

        if (!permissions.includes("Trainer Payment Page")) {
          delete updatedMenu[8];
        }

        if (!permissions.includes("Bulk Search Page")) {
          delete updatedMenu[9];
        }

        if (!permissions.includes("Reports Page")) {
          delete updatedMenu[10];
        }

        if (!updateData.includes("Settings Page")) {
          delete updatedMenu[12];
        }

        setSideMenuOptions(updatedMenu);
      }
    } catch (error) {
      console.log("user permissions error", error);
    }
  };

  const renderMenuItems = (menuConfig) => {
    return Object.entries(menuConfig).map(([key, item]) => ({
      key: item.path,
      icon: item.icon,
      label: (
        <Link
          to={`/${item.path}`}
          className="side-menu-link"
          style={{ color: "inherit" }}
        >
          {item.title}
        </Link>
      ),
    }));
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
      forceSubMenuRender={true}
    />
  );
}
