/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyD87ODim6vEIhf8gvsvZBuo2tgxIcDR0MA",
  authDomain: "acte-crm-test.firebaseapp.com",
  projectId: "acte-crm-test",
  messagingSenderId: "443220571276",
  appId: "1:443220571276:web:df894d36f9f2bfe15b37a9",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background Message Received:", payload);

  const title = payload.data.title || "Notification";

  let body = "You have a new notification";
  if (payload.data.raw) {
    try {
      const parsed = JSON.parse(payload.data.raw);
      body = Object.entries(parsed)
        .map(([key, val]) => `${key.replace(/_/g, " ")}: ${val}`)
        .join("\n");
    } catch {
      body = payload.data.raw;
    }
  }

  self.registration.showNotification(title, {
    body,
    icon: `${self.origin}/crm.png`,
  });
});
