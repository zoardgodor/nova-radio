const CACHE_NAME = "nova-radio-v10";

const FILES = [
    "./?v=10",
    "./index.html?v=10",
    "./styles.css?v=10",
    "./script.js?v=10",
    "./translations.js?v=10",
    "./manifest.json?v=10",
    "./icon-192.png?v=10",
    "./icon-512.png?v=10"
];


self.addEventListener(
"install",
event=>{

    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache=>cache.addAll(FILES))
    );

});


self.addEventListener(
"fetch",
event=>{

    event.respondWith(
        caches.match(event.request)
        .then(response=>{

            return response || fetch(event.request);

        })
    );

});


self.addEventListener(
"activate",
event=>{

    event.waitUntil(
        caches.keys()
        .then(keys=>{

            return Promise.all(
                keys
                .filter(key=>key !== CACHE_NAME)
                .map(key=>caches.delete(key))
            );

        })
        .then(()=>self.clients.claim())
    );

});
