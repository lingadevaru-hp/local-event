// Basic service worker for PWA - Cache-first strategy for static assets

const CACHE_NAME = 'local-pulse-ka-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  // Add paths to critical JS, CSS, and image files that should be cached.
  // For Next.js, these paths might include hashed filenames from the .next/static directory.
  // This often requires more dynamic configuration, possibly with tools like next-pwa or Workbox.
  // Example (paths will vary based on build):
  // '/_next/static/css/main.css', 
  // '/_next/static/chunks/main-app.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'}))); // Force network request during install
      })
      .catch(error => {
        console.error('Failed to cache resources during install:', error);
      })
  );
  self.skipWaiting(); 
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); 
});

self.addEventListener('fetch', event => {
  // For API calls or dynamic content, you might want a network-first strategy.
  // Example: if (event.request.url.includes('/api/')) { /* network first */ }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network, then cache it
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
            console.error('Fetch failed; returning offline page instead.', error);
            // Optional: return an offline fallback page if fetch fails
            // return caches.match('/offline.html'); 
        });
      })
  );
});

// Basic push notification listener (placeholder)
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'Local Pulse Karnataka', body: 'New update available!', icon: '/icons/icon-192x192.png' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png', // For Android status bar
      data: {
        url: data.url || '/' // URL to open on notification click
      }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlToOpen = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
