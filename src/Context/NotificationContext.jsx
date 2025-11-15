import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { getNotifications } from "../features/ApiService/action";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const getLoginUserDetails = localStorage.getItem("loginUserDetails");
  const convertAsJson = JSON.parse(getLoginUserDetails);
  const userId = convertAsJson?.user_id; // get logged-in user id

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications(convertAsJson?.user_id);
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    if (!userId) return;

    fetchNotifications(); // initial load

    const interval = setInterval(() => {
      fetchNotifications(); // polling every 5 sec
    }, 5000);

    return () => clearInterval(interval); // cleanup
  }, [userId]);

  return (
    <NotificationContext.Provider value={{ notifications, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
