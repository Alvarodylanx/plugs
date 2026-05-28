self.addEventListener('push', function (event) {
  if (!event.data) return;

  let payload;
  try { payload = event.data.json(); } catch { payload = { title: 'Quikz', body: event.data.text() }; }

  const title = payload.title || 'Quikz — Time to test yourself!';
  const options = {
    body: payload.body || 'Tap to answer a quick question',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'quikz',
    renotify: true,
    data: payload.data || {},
    actions: [
      { action: 'answer', title: 'Answer now' },
      { action: 'dismiss', title: 'Later' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const data = event.notification.data;
  const url = data?.noteId ? `/quizzes?quikz=1` : '/quizzes';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'QUIKZ_PUSH', question: data });
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
