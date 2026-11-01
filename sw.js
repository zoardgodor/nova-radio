const CACHE_NAME = "nova-radio-v15";

const FILES = [
    "./?v=15",
    "./index.html?v=15",
    "./styles.css?v=15",
    "./script.js?v=15",
    "./translations.js?v=15",
    "./manifest.json?v=15",
    "./icon-192.png?v=15",
    "./icon-512.png?v=15"
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
