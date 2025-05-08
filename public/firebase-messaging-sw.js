
// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker with your Firebase project configuration
const firebaseConfig = {
  apiKey: "%NEXT_PUBLIC_FIREBASE_API_KEY%",
  authDomain: "%NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN%",
  projectId: "%NEXT_PUBLIC_FIREBASE_PROJECT_ID%",
  storageBucket: "%NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET%",
  messagingSenderId: "%NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID%",
  appId: "%NEXT_PUBLIC_FIREBASE_APP_ID%"
};

// These %VAR_NAME% will be replaced by a build script or manually.
// For a Next.js app, these are typically available via process.env in the server or build time,
// but service workers run in a different context.
// A common approach is to have a script that generates this file with actual values during build.
// For now, these are placeholders. You'd need a mechanism to inject real values.

let app;
if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

let messaging;
if (firebase.messaging.isSupported()) {
  messaging = firebase.messaging(app);

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    const notificationTitle = payload.notification?.title || "New Notification";
    const notificationOptions = {
      body: payload.notification?.body || "You have a new update.",
      icon: payload.notification?.icon || '/icons/icon-192x192.png',
      data: payload.data // This will contain any data sent with the notification
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click Received.');
  event.notification.close();
  const notificationData = event.notification.data;
  const urlToOpen = notificationData?.url || notificationData?.FCM_MSG?.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
