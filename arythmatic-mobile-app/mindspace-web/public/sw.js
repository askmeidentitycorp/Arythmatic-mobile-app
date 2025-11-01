self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('mindspace-v1').then((cache) => cache.addAll([
      '/',
      '/manifest.json',
    ]))
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((resp) => resp || fetch(event.request))
  );
});
