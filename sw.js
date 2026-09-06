const CACHE_NAME = "nova-radio-v12";

const FILES = [
    "./?v=12",
    "./index.html?v=12",
    "./styles.css?v=12",
    "./script.js?v=12",
    "./translations.js?v=12",
    "./manifest.json?v=12",
    "./icon-192.png?v=12",
    "./icon-512.png?v=12"
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
