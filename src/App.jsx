import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import Pages from "./features/Pages/Pages";
import { Provider } from "react-redux";
import { reduxStore } from "./features/Redux/Store";
import { requestForToken, onMessageListener } from "./firebase";
import { NotificationProvider } from "./Context/NotificationContext";

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
    // Case 1: BLOCKED — cannot re-request
    if (Notification.permission === "denied") {
      // alert(
      //   "You have blocked notifications for this site.\n\n" +
      //     "👉 Please go to your browser settings and allow notifications."
      // );
      return;
    }

    // Case 2: Ask user
    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      console.log("Notification permission granted.");
      requestForToken(); // Only now request token
    }
  };

  useEffect(() => {
    const init = async () => {
      // Case 1: Already granted — request token directly
      if (Notification.permission === "granted") {
        await requestForToken();
      }

      // Case 2: Default — ask permission
      if (Notification.permission === "denied") {
        askPermission(); // Show popup
      }

      // Foreground notifications handler
      onMessageListener().then((payload) => {
        alert(`${payload.notification.title}: ${payload.notification.body}`);
      });
    };

    init();
  }, []);

  return (
    <div className="App">
      <Provider store={reduxStore}>
        <NotificationProvider>
          <BrowserRouter>
            <Pages />
          </BrowserRouter>
        </NotificationProvider>
      </Provider>
    </div>
  );
}

export default App;
