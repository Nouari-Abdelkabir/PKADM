const CACHE_NAME = 'autoroute-pr-tracker-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './routes.js'
];

// تثبيت وحفظ ملفات التطبيق في ذاكرة الهاتف
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// تشغيل التطبيق من الذاكرة المحلية عند انقطاع الإنترنت
self.addEventListener('fetch', function(event) {
    event.respondWith(
        fetch(event.request).catch(function() {
            return caches.match(event.request);
        })
    );
});
