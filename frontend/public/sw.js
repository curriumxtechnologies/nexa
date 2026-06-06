// public/sw.js
const CACHE_NAME = 'nexa-push-v1';

// Listen for push events from the server
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'Nexa',
      body: event.data.text(),
    };
  }

  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/nexa-icon.png',
    badge: data.badge || '/nexa-icon.png',
    tag: data.tag || 'nexa-notification',
    requireInteraction: data.requireInteraction ?? true,
    vibrate: data.vibrate || [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [
      {
        action: 'open',
        title: 'Open',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Nexa', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  let url = '/inbox';

  // Route based on notification type
  switch (notificationData.type) {
    case 'new_email':
      url = `/inbox/${notificationData.emailId || ''}`;
      break;
    case 'team_invite':
      url = '/teams';
      break;
    case 'login_alert':
      url = '/settings/security';
      break;
    case 'domain_verified':
      url = '/settings/domains';
      break;
    default:
      url = '/inbox';
  }

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it and navigate
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus().then(() => {
              if ('navigate' in client) {
                return client.navigate(url);
              }
            });
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          event.oldSubscription.options.applicationServerKey
        ),
      })
      .then((newSubscription) => {
        // Send new subscription to server
        return fetch('/api/notifications/push-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: newSubscription,
            deviceType: 'web',
          }),
          credentials: 'include',
        });
      })
  );
});

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = self.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Install & activate
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});