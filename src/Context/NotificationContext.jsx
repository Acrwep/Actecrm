import { createContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { getNotifications } from "../features/ApiService/action";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [prevLeadCount, setPrevLeadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const getLoginUserDetails = localStorage.getItem("loginUserDetails");
  const convertAsJson = JSON.parse(getLoginUserDetails);
  const userId = convertAsJson?.user_id; // get logged-in user id
  const leadCountRef = useRef(0);

  const fetchNotifications = async (userId) => {
    if (import.meta.env.PROD) {
      const payload = {
        user_id: userId,
        page: 1,
      };
      try {
        const res = await getNotifications(payload);
        console.log("notification response", res);
        setNotifications(res.data.data);
        //live-lead count handling
        const lead_count = res?.data?.lead_count || 0;
        console.log("counttt", lead_count, leadCountRef.current);

        // Play sound ONLY once when increased
        if (lead_count > leadCountRef.current) {
          playNotificationSound();
        }

        // Update ref instantly (no re-render)
        leadCountRef.current = lead_count;
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
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
    }, 2000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("callGetNotificationApi", handleStorageChange);
    };
  }, []);

  const playNotificationSound = () => {
    const audio = new Audio("/notification.wav");
    audio.play().catch((error) => console.log("Audio play blocked:", error));
  };

  return (
    <NotificationContext.Provider value={{ notifications, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
