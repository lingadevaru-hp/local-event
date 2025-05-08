// Scripts for firebase and firebase messaging
// It's important to use the same version of Firebase SDKs across your app and service worker.
// Using 9.22.1 as per the original firebase-messaging-sw.js.
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker with your Firebase project configuration
// IMPORTANT: These %VAR_NAME% placeholders MUST be replaced with actual values during a build process
// or by dynamically fetching the config if your setup allows.
const firebaseConfig = {
  apiKey: "%NEXT_PUBLIC_FIREBASE_API_KEY%",
  authDomain: "%NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN%",
  projectId: "%NEXT_PUBLIC_FIREBASE_PROJECT_ID%",
  storageBucket: "%NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET%",
  messagingSenderId: "%NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID%",
  appId: "%NEXT_PUBLIC_FIREBASE_APP_ID%"
};

let app;
if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

let messaging;
if (firebase.messaging.isSupported() && app) {
  messaging = firebase.messaging(app);

  // Handle background messages for FCM
  messaging.onBackgroundMessage((payload) => {
    console.log('[Service Worker] Received Firebase background message ', payload);
    
    const notificationTitle = payload.notification?.title || "New Notification";
    const notificationOptions = {
      body: payload.notification?.body || "You have a new update.",
      icon: payload.notification?.icon || '/icons/icon-192x192.png', // Default icon
      data: payload.data // This will contain any data sent with the notification
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} else {
    console.log('[Service Worker] Firebase Messaging is not supported or Firebase app not initialized.');
}


const CACHE_NAME = 'local-pulse-cache-v3'; // Increment version for updates
const urlsToCache = [
  '/',
  '/manifest.json',
  '/offline.html', // Ensure offline page is cached
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other critical static assets if any (e.g., global CSS, fonts not handled by Next.js optimization)
  // Next.js static assets (_next/static/*) are typically versioned and handled by runtime caching.
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        const cachePromises = urlsToCache.map(urlToCache => {
          return cache.add(new Request(urlToCache, {cache: 'reload'})); // Fetch fresh resources during install
        });
        return Promise.all(cachePromises);
      })
      .catch(error => {
        console.error('[Service Worker] Cache add failed during install:', error);
      })
  );
  self.skipWaiting(); // Activate new service worker immediately
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
  return self.clients.claim(); // Take control of uncontrolled clients
});

self.addEventListener('fetch', event => {
  // For navigation requests (HTML pages), try network first, then cache, then offline page.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            // If fetch fails (e.g. network error) or returns an error page, try cache.
            // This 'return response' was problematic if it was e.g. a 404 from network.
            // Instead, we should catch the fetch error and then try cache.
             console.log('[Service Worker] Network request for navigation failed or returned non-200 for:', event.request.url, response?.status);
             // Fall through to catch block for non-successful network responses.
             if (response && response.ok) { // Only cache good responses
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
             }
             return response;
          }
          // If successful, cache and return the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Network failed or returned non-OK, try to serve from cache
          console.log('[Service Worker] Network fetch failed for navigation, trying cache for:', event.request.url);
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
          return response; // Return from cache
        }
        // Not in cache, fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 ) { // Don't cache opaque responses or errors without `type: 'basic'`
              return networkResponse;
            }
            // If successful, cache and return the response
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          }
        ).catch(error => {
          console.error('[Service Worker] Fetch failed for non-navigate asset:', event.request.url, error);
          // For non-critical assets like images, you might want to return a placeholder if not cached.
          // For JS/CSS, if not cached and network fails, it will likely break the page.
          // The offline.html fallback is primarily for navigation.
        });
      })
  );
});


// Generic push listener (can be triggered by FCM or other push services)
self.addEventListener('push', event => {
  console.log('[Service Worker] Push Received.');
  const pushData = event.data ? event.data.json() : {};

  const title = pushData.title || 'Local Pulse Update';
  const options = {
    body: pushData.body || 'Something new happened!',
    icon: pushData.icon || '/icons/icon-192x192.png',
    badge: pushData.badge || '/icons/icon-96x96.png', 
    vibrate: pushData.vibrate || [200, 100, 200], 
    data: {
      url: pushData.url || '/', 
      ...pushData.data 
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Listener for notification click
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();
  
  const notificationData = event.notification.data;
  // Try to get URL from standard payload.data.url or FCM specific paths
  const urlToOpen = notificationData?.url || notificationData?.FCM_MSG?.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Check if a window is already open at the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
