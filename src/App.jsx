import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import Pages from "./features/Pages/Pages";
import { BiBell } from "react-icons/bi";
import { Provider } from "react-redux";
import { reduxStore } from "./features/Redux/Store";
import { requestForToken, onMessageListener } from "./firebase";
import { NotificationProvider } from "./Context/NotificationContext";
import { CommonMessage } from "./features/Common/CommonMessage";

function App() {
  const [permission, setPermission] = useState(Notification.permission);

  // Disable logs in production
  if (import.meta.env.PROD) {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    console.warn = () => {};
    console.error = () => {};
  }

  const askPermission = async () => {
    // If previously denied, we can't re-request — user must change browser settings
    if (Notification.permission === "denied") {
      CommonMessage("warning", "Unblock Notification for this site");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        console.log("Notification permission granted.");
        await requestForToken(); // get FCM token now
      } else {
        console.log("Notification permission:", result);
      }
    } catch (err) {
      console.error("requestPermission error:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      // If already granted — request token
      if (Notification.permission === "granted") {
        await requestForToken();
      }

      // If default (not yet asked) — ask (or let user click button)
      if (Notification.permission === "default") {
        // optionally ask immediately:
        // await askPermission();

        // or wait for user gesture (recommended)
        console.log(
          "Notification permission is default. Call askPermission() on user action."
        );
      }

      // Foreground notifications handler
      onMessageListener()
        .then((payload) => {
          if (payload?.notification) {
            // keep your UI-friendly notification rather than alert if possible
            alert(
              `${payload.notification.title}: ${payload.notification.body}`
            );
          }
        })
        .catch((err) => {
          // onMessageListener might reject if messaging not initialized
          console.warn("onMessageListener error:", err);
        });
    };

    init();
  }, []);

  return (
    <div className="App">
      <Provider store={reduxStore}>
        <NotificationProvider>
          <BrowserRouter>
            {/* {permission === "granted" ? (
              ""
            ) : (
              <div className="enable_notification_button_container">
                <button
                  className="enable_notification_button"
                  onClick={askPermission}
                >
                  <BiBell size={20} />
                  {permission === "granted"
                    ? "Notifications Enabled"
                    : "Enable Notifications"}
                </button>
              </div>
            )} */}

            <Pages />
          </BrowserRouter>
        </NotificationProvider>
      </Provider>
    </div>
  );
}

export default App;
