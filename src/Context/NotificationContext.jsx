import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { getNotifications } from "../features/ApiService/action";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const getLoginUserDetails = localStorage.getItem("loginUserDetails");
  const convertAsJson = JSON.parse(getLoginUserDetails);
  const userId = convertAsJson?.user_id; // get logged-in user id

  const fetchNotifications = async (user_id) => {
    try {
      const res = await getNotifications(user_id);
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const raw = localStorage.getItem("loginUserDetails");
      const user = raw ? JSON.parse(raw) : null;

      if (user?.user_id) {
        fetchNotifications(user?.user_id);
      }
    };

    // Run on mount
    handleStorageChange();

    // Listen for custom event fired after login
    window.addEventListener("callGetNotificationApi", handleStorageChange);

    // Polling every 5 seconds
    const interval = setInterval(() => {
      const raw = localStorage.getItem("loginUserDetails");
      const user = raw ? JSON.parse(raw) : null;

      if (user?.user_id) {
        fetchNotifications(user?.user_id);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("callGetNotificationApi", handleStorageChange);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
