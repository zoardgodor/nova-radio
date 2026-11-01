const CACHE_NAME = "nova-radio-v14";

const FILES = [
    "./?v=14",
    "./index.html?v=14",
    "./styles.css?v=14",
    "./script.js?v=14",
    "./translations.js?v=14",
    "./manifest.json?v=14",
    "./icon-192.png?v=14",
    "./icon-512.png?v=14"
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
