const CACHE_NAME = 'lumenforge-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/design-system.css',
  '/css/home.css',
  '/js/common.js',
  '/js/auth.js',
  '/js/checkout.js',
  '/images/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Trả về dữ liệu từ cache nếu có
        if (response) {
          return response;
        }
        // Nếu không, thực hiện fetch từ mạng
        return fetch(event.request).catch(() => {
          // Fallback offline (có thể điều hướng về trang offline html nếu cần)
          // Hiện tại chỉ im lặng fail nếu mạng rớt
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  // Xóa cache cũ nếu tên cache đổi
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
