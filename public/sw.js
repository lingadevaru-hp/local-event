
const CACHE_NAME = 'local-pulse-cache-v2'; // Increment version for updates
const urlsToCache = [
  '/',
  '/manifest.json',
  // Next.js static assets are typically versioned, making them hard to list statically.
  // Consider using Workbox for more robust caching in a real app.
  // For now, we'll cache main entry points and rely on browser caching for versioned assets.
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other critical static assets if any (e.g., global CSS, fonts not handled by Next.js optimization)
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        // Use "no-cache" to ensure fresh resources during install, especially for manifest.json
        const cachePromises = urlsToCache.map(urlToCache => {
          return cache.add(new Request(urlToCache, {cache: 'reload'}));
        });
        return Promise.all(cachePromises);
      })
      .catch(error => {
        console.error('[Service Worker] Cache add failed during install:', error);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // console.log('[Service Worker] Fetching:', event.request.url);

  // For navigation requests (HTML pages), try network first, then cache, then offline page.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response; // Potentially an error page from the server
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Network failed, try to serve from cache
          return caches.match(event.request)
            .then(cachedResponse => {
              return cachedResponse || caches.match('/offline.html'); // Fallback to offline page
            });
        })
    );
    return;
  }

  // For other requests (CSS, JS, images), use cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // console.log('[Service Worker] Returning from cache:', event.request.url);
          return response;
        }
        // console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request).then(
          networkResponse => {
            if (!networkResponse || networkResponse.status !== 200) { // Don't cache opaque responses or errors
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          }
        ).catch(error => {
          console.error('[Service Worker] Fetch failed for non-navigate:', event.request.url, error);
          // For non-critical assets, failing is okay, browser will show broken image/style.
          // You could return a placeholder for images if desired.
        });
      })
  );
});


// Listener for push notifications
self.addEventListener('push', event => {
  console.log('[Service Worker] Push Received.');
  const pushData = event.data ? event.data.json() : {};

  const title = pushData.title || 'Local Pulse Update';
  const options = {
    body: pushData.body || 'Something new happened!',
    icon: pushData.icon || '/icons/icon-192x192.png',
    badge: pushData.badge || '/icons/icon-96x96.png', // Small icon for notification bar
    vibrate: pushData.vibrate || [200, 100, 200], // Vibration pattern
    data: {
      url: pushData.url || '/', // URL to open on click
      eventId: pushData.eventId, // Custom data
      ...pushData.data // any other custom data
    },
    // Actions (buttons) for notifications - Example
    // actions: [
    //   { action: 'explore', title: 'Explore', icon: '/icons/action-explore.png' },
    //   { action: 'close', title: 'Close', icon: '/icons/action-close.png' },
    // ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Listener for notification click
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();
  
  const notificationData = event.notification.data;
  const urlToOpen = notificationData.url || '/';

  // if (event.action === 'explore' && notificationData.eventId) {
  //   clients.openWindow(`/events/${notificationData.eventId}`);
  // } else 
  if (event.action === 'close') {
    // Do nothing, notification is already closed
  } else {
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
  }
});

// This is for Firebase Cloud Messaging when the app is in the background or closed.
// It needs to be in a separate file `firebase-messaging-sw.js` in the public directory.
// However, since sw.js is the main service worker, we can try to import and initialize firebase here
// if firebase-messaging-sw.js is not used. This is generally not recommended.
// The typical setup is:
// 1. sw.js for PWA caching and generic push.
// 2. firebase-messaging-sw.js specifically for FCM background messages.
// For simplicity in this context, I'm putting FCM listener here, but it might need firebase-app.js and firebase-messaging.js.
// If using Firebase, ensure you initialize it:
/*
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

const firebaseConfig = {
  // Your Firebase config object from the Firebase console
  // apiKey: "...",
  // authDomain: "...",
  // projectId: "...",
  // storageBucket: "...",
  // messagingSenderId: "...", // This is crucial for FCM
  // appId: "...",
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

let messaging;
if (firebase.messaging.isSupported()) {
   messaging = firebase.messaging();
   messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.image, // Or a default icon
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}
*/
// For now, the generic push listeners above will handle notifications if sent via Web Push protocol.
// FCM specific background handling usually requires its own setup as hinted above.
// The current project uses `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, which implies FCM is intended.
// A `public/firebase-messaging-sw.js` would be the standard way.

// Placeholder for offline page. Create this file in public directory.
// public/offline.html
// <!DOCTYPE html>
// <html>
// <head>
//   <title>Offline - Local Pulse</title>
//   <meta name="viewport" content="width=device-width, initial-scale=1">
//   <style>
//     body { font-family: sans-serif; text-align: center; padding: 20px; }
//     h1 { color: #3498db; }
//   </style>
// </head>
// <body>
//   <h1>You are offline</h1>
//   <p>Please check your internet connection and try again.</p>
//   <p><a href="/">Try to Reload</a></p>
// </body>
// </html>
