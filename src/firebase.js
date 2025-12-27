// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { saveFirebaseToken } from "./features/ApiService/action";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD87ODim6vEIhf8gvsvZBuo2tgxIcDR0MA",
  authDomain: "acte-crm-test.firebaseapp.com",
  projectId: "acte-crm-test",
  storageBucket: "acte-crm-test.firebasestorage.app",
  messagingSenderId: "443220571276",
  appId: "1:443220571276:web:df894d36f9f2bfe15b37a9",
  measurementId: "G-YXQ7TGZHYT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey:
        "BAAUMeoaXPH6yCaFp1igN5CpY2Kv5hkKRAc7clFmZ7SqXyDhTuqjJcDP-Ov7BK8cuGBybePF_AzAD0OISjFPXRA",
    });

    if (currentToken) {
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);

      console.log("FCM Token:", currentToken);
      // ✅ Send token to backend
      const payload = {
        user_id: convertAsJson?.user_id,
        token: currentToken,
      };
      await saveFirebaseToken(payload);
    } else {
      console.log("No registration token available. Request permission first.");
    }
  } catch (err) {
    console.error("An error occurred while retrieving token.", err);
  }
};

// Listen for foreground messages
export const onMessageListener = (callback) => {
  return onMessage(messaging, (payload) => {
    console.log("Foreground message:", payload);
    callback(payload.data);
  });
};
