import { createContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { getNotifications } from "../features/ApiService/action";
import { CommonMessage } from "../features/Common/CommonMessage";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const leadCountRef = useRef(0);
  const socketRef = useRef(null);

  const fetchNotifications = async (userId) => {
    const payload = {
      user_id: userId,
      page: 1,
    };
    try {
      const res = await getNotifications(payload);
      const data = res.data.data;
      setNotifications(data);

      // Calculate initial unread count
      const initialUnread = data.filter((n) => n.is_read === 0).length;
      setUnreadCount(initialUnread);

      const lead_count = res?.data?.lead_count || 0;
      leadCountRef.current = lead_count;
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio("/notification.wav");
    audio.play().catch((error) => console.log("Audio play blocked:", error));
  };

  const setupSocket = (userId) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Connected to notification socket");
      socket.emit("register", userId);
    });

    socket.on("notification", (newNotification) => {
      console.log("Real-time notification received:", newNotification);

      // Add 'is_read: 0' if not present for correct count
      const notificationWithReadStatus = {
        ...newNotification,
        is_read: newNotification.is_read ?? 0,
      };

      setNotifications((prev) => [notificationWithReadStatus, ...prev]);

      if (notificationWithReadStatus.is_read === 0) {
        setUnreadCount((prev) => prev + 1);
      }

      // playNotificationSound();

      // Notify components that something might need refreshing
      window.dispatchEvent(
        new CustomEvent("socket_notification", {
          detail: notificationWithReadStatus,
        }),
      );
    });

    socket.on("lead_update", (data) => {
      console.log("Lead update received:", data);
      const newCount = data.lead_count;
      if (newCount > leadCountRef.current) {
        playNotificationSound();
      }
      leadCountRef.current = newCount;

      // Specifically notify Lead components
      window.dispatchEvent(
        new CustomEvent("refreshLiveLeads", { detail: data }),
      );
    });

    socket.on("force_logout", () => {
      console.warn("Forced logout: session taken by another device.");
      // alert(
      //   "You have been logged out because a new login was detected on another system.",
      // );
      CommonMessage(
        "warning",
        "You have been logged out because a new login was detected on another system.",
      );
      setTimeout(() => {
        localStorage.removeItem("AccessToken");
        localStorage.removeItem("loginUserDetails");
        sessionStorage.clear();
        window.location.href = "/login";
      }, 2000);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from notification socket");
    });

    socketRef.current = socket;
  };

  const logout = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setNotifications([]);
    setUnreadCount(0);
  };

  useEffect(() => {
    const handleInit = () => {
      const raw = localStorage.getItem("loginUserDetails");
      const user = raw ? JSON.parse(raw) : null;

      if (user?.user_id) {
        fetchNotifications(user.user_id);
        setupSocket(user.user_id);
      }
    };

    handleInit();

    window.addEventListener("callGetNotificationApi", handleInit);
    window.addEventListener("manualLogout", logout);

    return () => {
      logout();
      window.removeEventListener("callGetNotificationApi", handleInit);
      window.removeEventListener("manualLogout", logout);
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        setUnreadCount,
        fetchNotifications,
        logout,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
