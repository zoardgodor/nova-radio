const CACHE_NAME = "nova-radio-v6";

const FILES = [
    "./?v=6",
    "./index.html?v=6",
    "./styles.css?v=6",
    "./script.js?v=6",
    "./translations.js?v=6",
    "./manifest.json?v=6",
    "./icon-192.png?v=6",
    "./icon-512.png?v=6"
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
