/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyD87ODim6vEIhf8gvsvZBuo2tgxIcDR0MA",
  authDomain: "acte-crm-test.firebaseapp.com",
  projectId: "acte-crm-test",
  messagingSenderId: "443220571276",
  appId: "1:443220571276:web:df894d36f9f2bfe15b37a9",
});

const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) => {
//   console.log("Background Message Received:", payload);

//   const title = payload.data.title || "Notification";

//   let body = "You have a new notification";
//   if (payload.data.raw) {
//     try {
//       const parsed = JSON.parse(payload.data.raw);
//       body = Object.entries(parsed)
//         .map(([key, val]) => `${key.replace(/_/g, " ")}: ${val}`)
//         .join("\n");
//     } catch {
//       body = payload.data.raw;
//     }
//   }

//   self.registration.showNotification(title, {
//     body,
//     icon: `${self.origin}/crm.png`,
//   });
// });

// messaging.onBackgroundMessage((payload) => {
//   console.log("🔥 Background Message Received:", payload);

//   const title = payload.data?.title || "Notification";
//   let body = payload.data?.body || "";

//   const parsedMessage = {};

//   body.split("\n").forEach((line) => {
//     const [key, value] = line.split(":").map((s) => s.trim());
//     if (key && value) parsedMessage[key.replace(/ /g, "_")] = value;
//   });

//   self.registration.showNotification(title, {
//     body,
//     icon: `${self.origin}/crm.png`,
//   });
// });

const parseNotificationString = (str) => {
  const obj = {};
  str.split("\n").forEach((line) => {
    const [key, value] = line.split(":");
    if (key && value) {
      obj[key.trim().replace(/ /g, "_")] = value.trim();
    }
  });
  return obj;
};

messaging.onBackgroundMessage((payload) => {
  console.log("🔥 Background Message Received:", payload);

  const title = payload.data?.title || "Notification";
  let raw = payload.data?.body || "";

  let body = "";

  try {
    const message = parseNotificationString(raw);

    // Payment Rejected OR Trainer Rejected with object message
    if (
      title === "Payment Rejected" ||
      (title === "Trainer Rejected" && typeof message === "object")
    ) {
      body =
        `Customer Name: ${message.customer_name ?? "-"} | ` +
        `Mobile: ${message.customer_phonecode ?? ""}${
          message.customer_phone ?? ""
        } | ` +
        `Course: ${message.customer_course ?? "-"}`;
    } else if (title === "Server Raised" && typeof message === "object") {
      body =
        `Customer Name: ${message.customer_name ?? "-"} | ` +
        `Mobile: ${message.customer_phonecode ?? ""}${
          message.customer_phone ?? ""
        } | ` +
        `Course: ${message.customer_course ?? "-"}`;
    } else {
      // Plain string message fallback
      body = typeof message === "string" ? message : raw;
    }
  } catch (e) {
    // raw string message fallback
    body = raw;
  }

  self.registration.showNotification(title, {
    body: body,
    icon: `${self.origin}/crm.png`,
  });
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("eventtttttttttt", event);
  const title = event?.notification?.title || "";

  if (title == "New Lead Available") {
    console.log("comesssssssss");
    const targetUrl = "/lead-manager";
    console.log("targetUrl", targetUrl);

    event.waitUntil(
      self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientsArr) => {
          for (const client of clientsArr) {
            if (client.url.includes(self.origin)) {
              client.focus();
              client.postMessage({
                type: "NAVIGATE",
                url: targetUrl,
              });
              return;
            }
          }
          return self.clients.openWindow(self.origin + targetUrl);
        }),
    );
  }
  event.notification.close();
  // const data = {
  //   title: event.notification.title,
  //   message: event.notification.body,
  // };

  // event.waitUntil(
  //   self.clients
  //     .matchAll({ type: "window", includeUncontrolled: true })
  //     .then((clientList) => {
  //       for (const client of clientList) {
  //         if (client.url.includes("/dashboard")) {
  //           client.focus();
  //           return;
  //         }
  //       }

  //       return self.clients.openWindow("/dashboard").then((client) => {
  //         client.postMessage({
  //           type: "BACKGROUND_NOTIFICATION",
  //           data,
  //         });
  //       });
  //     })
  // );
});
